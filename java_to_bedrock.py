#!/usr/bin/env python3
"""
Java 方块/物品模型 → 基岩版实体模型 转换工具。

将 Minecraft Java Edition 的 block/item JSON 模型转换为
Bedrock Edition 的 geometry JSON 实体模型。

坐标系变换（参照 Blockbench bedrock.js compileCube/compileGroup）：
  - 网格居中：Java 角点坐标(0~16) → 基岩居中坐标(-8~8)，X/Z 偏移 -8
  - Cube origin X = -(from[0] + size[0])  （X 轴取反）
  - Pivot X *= -1
  - Rotation X *= -1, Rotation Y *= -1, Rotation Z 不变
  - UV：Java 的 0~16 归一化空间 → 基岩的像素空间

用法:
  python java_to_bedrock.py egg_4.json
  python java_to_bedrock.py model.json -o output.geo.json
  python java_to_bedrock.py model.json --tex-w 64 --tex-h 64
  python java_to_bedrock.py model.json --material-map '{"0":"iron","1":"egg"}'
"""

import json
import math
import os
import sys
import argparse
from pathlib import Path
from copy import deepcopy


# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------

def path_to_name(filepath: str) -> str:
    return Path(filepath).stem


def resolve_texture_ref(ref: str, textures: dict) -> str:
    """解析 #xxx 纹理引用，返回实际纹理路径（去掉 ./ 和扩展名）"""
    if ref.startswith("#"):
        key = ref[1:]
        val = textures.get(key, ref)
    else:
        val = ref
    if isinstance(val, str):
        return path_to_name(val.replace("./", "").replace("\\", "/"))
    return path_to_name(str(val))


def build_texture_names(textures: dict) -> dict:
    """将 textures 映射中的每个变量名 → 纹理名（去掉路径和扩展名）"""
    result = {}
    for key, val in textures.items():
        if key == "particle":
            continue
        if isinstance(val, str):
            # "./iron_skillet_0" → "iron_skillet_0"
            result[key] = path_to_name(val.replace("./", "").replace("\\", "/"))
        else:
            result[key] = str(val)
    return result


def face_uv_to_pixel(uv: list, tex_w: int, tex_h: int) -> list:
    """
    Java face UV: [u1, v1, u2, v2] in 0~16 space
    → Bedrock pixel UV: [u, v, w, h] in pixel space
    """
    u1, v1, u2, v2 = uv
    u = round(u1 * tex_w / 16)
    v = round(v1 * tex_h / 16)
    w = round((u2 - u1) * tex_w / 16)
    h = round((v2 - v1) * tex_h / 16)
    return [u, v, w, h]


# ---------------------------------------------------------------------------
# 核心转换
# ---------------------------------------------------------------------------

def convert_element_to_cube(element: dict, texture_names: dict,
                             tex_w: int, tex_h: int,
                             default_material: str = None) -> dict:
    """
    将一个 Java element 转换为 Bedrock cube。
    返回 dict: {origin, size, uv, pivot?, rotation?} 或 None（无有效面时）
    """
    from_coords = element.get("from", [0, 0, 0])
    to_coords = element.get("to", [0, 0, 0])
    faces = element.get("faces", {})
    rotation_data = element.get("rotation")

    # ---- 1. 计算 origin + size ----
    # 网格居中：X 和 Z 偏移 -8
    fx, fy, fz = from_coords[0] - 8, from_coords[1], from_coords[2] - 8
    tx, ty, tz = to_coords[0] - 8, to_coords[1], to_coords[2] - 8

    origin_x = fx
    origin_y = fy
    origin_z = fz
    size_x = tx - fx
    size_y = ty - fy
    size_z = tz - fz

    # ---- X 轴取反 ----
    origin_x = -(origin_x + size_x)

    # ---- 2. 旋转处理 ----
    rotation = None
    pivot = None
    rotation_origin = None

    if rotation_data:
        if "axis" in rotation_data and "angle" in rotation_data:
            # 旧版单轴旋转
            axis_map = {"x": 0, "y": 1, "z": 2}
            axis_idx = axis_map.get(rotation_data["axis"], 1)
            angle = rotation_data.get("angle", 0)
            rot = [0, 0, 0]
            rot[axis_idx] = angle
            rotation_origin = rotation_data.get("origin", [8, 8, 8])
        elif any(k in rotation_data for k in ["x", "y", "z"]):
            # 新版多轴旋转
            rot = [
                rotation_data.get("x", 0),
                rotation_data.get("y", 0),
                rotation_data.get("z", 0),
            ]
            rotation_origin = rotation_data.get("origin", [8, 8, 8])
        else:
            rot = [0, 0, 0]
    else:
        rot = [0, 0, 0]

    # 应用网格居中和坐标变换到 pivot
    if rotation_origin:
        pivot = [
            rotation_origin[0] - 8,
            rotation_origin[1],
            rotation_origin[2] - 8,
        ]
        # X 取反（注意 pivot 是基于原始坐标系的）
        pivot[0] *= -1

    # 旋转轴 X/Y 取反
    rot[0] *= -1
    rot[1] *= -1

    if any(r != 0 for r in rot):
        rotation = rot
    else:
        rotation = None

    # ---- 3. UV 编译 (逐面模式) ----
    uv_obj = {}
    for face_key, face_data in faces.items():
        if face_data.get("texture") is None:
            continue

        java_uv = face_data.get("uv", [0, 0, 0, 0])
        pixel_uv = face_uv_to_pixel(java_uv, tex_w, tex_h)

        face_entry = {
            "uv": [pixel_uv[0], pixel_uv[1]],
            "uv_size": [pixel_uv[2], pixel_uv[3]],
        }

        # face rotation
        face_rot = face_data.get("rotation")
        if face_rot and face_rot != 0:
            face_entry["uv_rotation"] = face_rot

        # material_instance: 从纹理引用解析
        tex_ref = face_data.get("texture", "")
        tex_var = tex_ref.lstrip("#")
        material = texture_names.get(tex_var) or default_material
        if material:
            face_entry["material_instance"] = material

        # 上下面 UV 需要翻转（对应 Blockbench 的 compileCube 逻辑）
        if face_key in ("up", "down"):
            face_entry["uv"][0] += face_entry["uv_size"][0]
            face_entry["uv"][1] += face_entry["uv_size"][1]
            face_entry["uv_size"][0] *= -1
            face_entry["uv_size"][1] *= -1

        uv_obj[face_key] = face_entry

    if not uv_obj:
        return None

    cube = {
        "origin": [origin_x, origin_y, origin_z],
        "size": [size_x, size_y, size_z],
        "uv": uv_obj,
    }

    if rotation:
        cube["pivot"] = pivot or [0, 0, 0]
        cube["rotation"] = rotation

    return cube


def calculate_visible_bounds(elements: list) -> tuple:
    """
    参照 Blockbench calculateVisibleBox() 的计算方式：
      1. 取所有 element 的 from/to 作为 Java 空间 (0~16) 的包围盒
      2. 加上 offset [8, 8, 8]（等同于 centered 坐标系 → Java 0~16）
      3. width  = ceil(max(|max_x|,|max_z|,|min_x|,|min_z|) × 2 / 16)
      4. height = ceil(max_y / 16) - floor(min_y / 16)
      5. offset_y = (y_min_block + y_max_block) / 2
    """
    if not elements:
        return 2, 2, 1

    min_x = min_y = min_z = float("inf")
    max_x = max_y = max_z = float("-inf")

    for elem in elements:
        f = elem.get("from", [0, 0, 0])
        t = elem.get("to", [0, 0, 0])
        # 网格居中偏移同 convert_element_to_cube: X/Z -8
        fx, fy, fz = f[0] - 8, f[1], f[2] - 8
        tx, ty, tz = t[0] - 8, t[1], t[2] - 8

        min_x = min(min_x, fx, tx)
        max_x = max(max_x, fx, tx)
        min_y = min(min_y, fy, ty)
        max_y = max(max_y, fy, ty)
        min_z = min(min_z, fz, tz)
        max_z = max(max_z, fz, tz)

    # 还原到 Java 0~16 空间（+8 偏移）
    min_x += 8; max_x += 8; min_z += 8; max_z += 8
    min_y += 8; max_y += 8

    # Width: 2 × max horizontal extent, then /16 to block units
    radius = max(max_x, max_z, -min_x, -min_z)
    width = max(1, math.ceil(radius * 2 / 16))

    # Height: block units
    y_min_block = math.floor(min_y / 16)
    y_max_block = math.ceil(max_y / 16)
    height = max(1, y_max_block - y_min_block)
    offset_y = (y_min_block + y_max_block) / 2

    return width, height, offset_y


def get_cube_primary_material(cube: dict) -> str:
    """返回 cube 中出现次数最多的 material_instance。"""
    counts: dict[str, int] = {}
    for face_data in cube.get("uv", {}).values():
        mat = face_data.get("material_instance")
        if mat:
            counts[mat] = counts.get(mat, 0) + 1
    if not counts:
        return "default"
    return max(counts, key=lambda k: counts[k])


def group_cubes_by_material(cubes: list) -> list[dict]:
    """
    将 cubes 按 material_instance 分组，每组生成一个骨骼。
    骨骼 pivot 统一为 [0, 0, 0]。
    """
    groups: dict[str, list] = {}
    for cube in cubes:
        mat = get_cube_primary_material(cube)
        groups.setdefault(mat, []).append(cube)

    bones = []
    for mat, cube_list in groups.items():
        bone_name = mat if mat != "default" else "bone"
        bones.append({
            "name": bone_name,
            "pivot": [0, 0, 0],
            "rotation": [0, 180, 0],
            "cubes": cube_list,
        })
    return bones


def convert_java_to_bedrock(
    model: dict,
    tex_w: int = 16,
    tex_h: int = 16,
    identifier: str = None,
    default_material: str = None,
    texture_names: dict = None,
    group_by_material: bool = True,
) -> dict:
    """
    将 Java block/item 模型转换为 Bedrock geometry 结构。

    group_by_material=True 时，具有相同 material_instance 的 cube
    会被归入同一个骨骼，骨骼名即为材质名。
    """
    elements = model.get("elements", [])
    textures = model.get("textures", {})

    # 纹理映射：变量名 → 材质名
    tex_name_map = build_texture_names(textures)
    if texture_names:
        tex_name_map.update(texture_names)

    # 每个 element 转为一个 cube
    cubes = []
    for elem in elements:
        cube = convert_element_to_cube(
            elem, tex_name_map, tex_w, tex_h, default_material
        )
        if cube:
            cubes.append(cube)

    # 可见边界（参照 BB calculateVisibleBox）
    vis_w, vis_h, vis_off = calculate_visible_bounds(elements)

    # identifier: 加上 geometry. 前缀（匹配 BB 行为）
    if identifier:
        geo_id = identifier
    else:
        geo_id = "geometry.unknown"
    if not geo_id.startswith("geometry."):
        geo_id = "geometry." + geo_id

    # 骨骼分组
    if group_by_material and len(cubes) > 1:
        bones = group_cubes_by_material(cubes)
    else:
        bones = [{"name": "bone", "pivot": [0, 0, 0], "rotation": [0, 180, 0], "cubes": cubes}]

    geometry = {
        "description": {
            "identifier": geo_id,
            "texture_width": tex_w,
            "texture_height": tex_h,
            "visible_bounds_width": vis_w,
            "visible_bounds_height": vis_h,
            "visible_bounds_offset": [0, vis_off, 0],
        },
        "bones": bones,
    }

    return {
        "format_version": "1.21.0",
        "minecraft:geometry": [geometry],
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Java block/item 模型 → Bedrock geometry 实体模型转换",
    )
    parser.add_argument("input", help="Java 模型 JSON 文件名或路径")
    parser.add_argument("--output", "-o", help="输出文件路径（覆盖 --type 的默认目录）")
    parser.add_argument(
        "--type", "-t",
        choices=["block", "entity"],
        default="entity",
        help="输出目录类型: block→models/blocks, entity→models/entity/cit（默认 entity）",
    )
    parser.add_argument(
        "--cit-dir",
        default=r"D:\QQ下载\Mizunos 16 Craft JE CIT_1.20.1 （修复版）\assets\minecraft\optifine\cit",
        help="Java CIT 模型文件目录（默认: OptiFine CIT 目录）",
    )
    parser.add_argument("--tex-w", type=int, default=16, help="纹理宽度（默认 16）")
    parser.add_argument("--tex-h", type=int, default=16, help="纹理高度（默认 16）")
    parser.add_argument("--identifier", "-i", help="Bedrock geometry identifier")
    parser.add_argument(
        "--default-material", "-m",
        help="默认 material_instance（未匹配到的面使用此值）",
    )
    parser.add_argument(
        "--material-map",
        help='纹理变量→material 映射，JSON 格式，如 \'{"0":"iron","1":"egg"}\'',
    )
    parser.add_argument(
        "--no-prefix",
        action="store_true",
        help="identifier 不自动添加 cit. 前缀",
    )
    parser.add_argument(
        "--no-group",
        action="store_true",
        help="不按 material_instance 分组骨骼（默认会分组）",
    )
    args = parser.parse_args()

    # 解析输入路径：直接路径存在则用，否则在 CIT 目录下查找
    input_path = Path(args.input)
    if not input_path.exists():
        cit_dir = Path(args.cit_dir)
        alt_path = cit_dir / args.input
        if not alt_path.suffix:
            alt_path = alt_path.with_suffix(".json")
        if alt_path.exists():
            input_path = alt_path
        else:
            print(f"错误: 文件不存在: {args.input}", file=sys.stderr)
            print(f"      也尝试过: {alt_path}", file=sys.stderr)
            sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        model = json.load(f)

    # identifier
    identifier = args.identifier
    if not identifier:
        base = path_to_name(str(input_path))
        prefix = "" if args.no_prefix else "cit."
        identifier = f"{prefix}{base}"

    # material map
    material_map = None
    if args.material_map:
        material_map = json.loads(args.material_map)

    result = convert_java_to_bedrock(
        model,
        tex_w=args.tex_w,
        tex_h=args.tex_h,
        identifier=identifier,
        default_material=args.default_material,
        texture_names=material_map,
        group_by_material=not args.no_group,
    )

    # 输出路径：--output 优先，否则按 --type 选择默认目录
    if args.output:
        output_path = args.output
    else:
        base_name = path_to_name(str(input_path)) + ".geo.json"
        ws_root = Path(__file__).resolve().parent
        rp_base = ws_root / "resource_packs" / "Mizuno 16 Craft BE CIT" / "models"
        if args.type == "block":
            out_dir = rp_base / "blocks"
        else:
            out_dir = rp_base / "entity" / "cit"
        out_dir.mkdir(parents=True, exist_ok=True)
        output_path = str(out_dir / base_name)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent="\t", ensure_ascii=False)
        f.write("\n")

    print(f"转换完成: {input_path} → {output_path}")
    print(f"  identifier: {identifier}")
    bones = result["minecraft:geometry"][0]["bones"]
    total_cubes = sum(len(b["cubes"]) for b in bones)
    print(f"  bones: {len(bones)}, cubes: {total_cubes}")
    if len(bones) > 1:
        for b in bones:
            print(f"    {b['name']}: {len(b['cubes'])} cubes")


if __name__ == "__main__":
    main()