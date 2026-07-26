#!/usr/bin/env python3
"""
CIT entity 全套生成器 — Java 模型转换 + geo 解析 + 实体文件生成。

工作流 (一条命令完成全部):
    python generate_cit.py baked_potato_0
    → ① 从 Java CIT 目录找 baked_potato_0.json 转为 geo
    → ② 解析 geo 骨骼 → 生成 behavior / client / rc / animation / 碰撞箱

用法:
    python generate_cit.py baked_potato_0              # 自动转换 + 生成 (类型自检)
    python generate_cit.py raw_chicken_0_top            # _top 后缀自动识别为 top 类型
    python generate_cit.py -t top -n baked_potato_0     # 短参数: type=top, dry-run
    python generate_cit.py -C -g custom.geo.json name   # 跳过转换, 指定 geo
    python generate_cit.py apple_0 banana_1             # 支持多个

参数:
    -t, --type      实体类型: default/top (默认: 自动从名称检测 _top 后缀)
    -n, --dry-run   仅预览不写入
    -g, --geo       指定 geo 文件 (跳过自动查找)
    -C, --no-convert 跳过 Java→geo 转换 (默认自动查找并转换)
    --cit-dir       Java CIT 模型目录 (默认使用 java_to_bedrock.py 的内置路径)
"""

import sys
import json
import math
import argparse
import re
from pathlib import Path
from collections import defaultdict

# 导入 Java→Bedrock 转换模块
from java_to_bedrock import convert_java_to_bedrock, path_to_name


ROOT = Path(__file__).resolve().parent

BEHAVIOR_TEMPLATES = {
    "default": "behavior_packs/Mizuno 16 Craft BE CIT/entities/cit/melon_slice_0.json",
    "top":     "behavior_packs/Mizuno 16 Craft BE CIT/entities/cit/raw_porkchop_2_top.json",
}
BEHAVIOR_BASE_NAMES = {
    "default": "melon_slice_0",
    "top":     "raw_porkchop_2_top",
}

GEO_SEARCH_DIR   = "resource_packs/Mizuno 16 Craft BE CIT/models/entity/cit"
ANIMATION_FILE   = "resource_packs/Mizuno 16 Craft BE CIT/animations/cit/cit.wall.animation.json"
JAVA_CIT_DIR     = r"D:\QQ下载\Mizunos 16 Craft JE CIT_1.20.1 （修复版）\assets\minecraft\optifine\cit"

OUTPUT = {
    "behavior": "behavior_packs/Mizuno 16 Craft BE CIT/entities/cit/{name}.json",
    "client":   "resource_packs/Mizuno 16 Craft BE CIT/entity/cit/{name}.json",
    "rc":       "resource_packs/Mizuno 16 Craft BE CIT/render_controllers/cit/{name}.render_controller.json",
}


# ═══════════════════════════════════════════════════════════
# 工具
# ═══════════════════════════════════════════════════════════

def validate_name(name: str) -> str:
    if not re.fullmatch(r"[a-z][a-z0-9_]*", name):
        raise ValueError(f"非法名称 '{name}'：只允许小写字母、数字、下划线，且必须以字母开头。")
    return name


def auto_detect_type(name: str) -> str:
    """从名称后缀自动检测实体类型: _top → top, 否则 default"""
    if name.endswith("_top"):
        return "top"
    return "default"


def resolve_geo(name: str, geo_override: str | None) -> tuple[Path, list[str]]:
    if geo_override:
        p = Path(geo_override)
        if not p.is_absolute():
            p = ROOT / p
    else:
        p = ROOT / GEO_SEARCH_DIR / f"{name}.geo.json"

    if not p.exists():
        raise FileNotFoundError(f"geo 文件不存在: {p}\n请先确保 Java 模型存在 (或用 --no-convert -g 指定 geo)。")

    data = json.loads(p.read_text(encoding="utf-8"))
    bones = data["minecraft:geometry"][0]["bones"]
    bone_names = [b["name"] for b in bones]
    bone_names.sort(key=lambda bn: (bn != name, bn))
    return p, bone_names


def extract_family(name: str) -> str:
    base = name
    for sfx in ("_top", "_wall", "_floor"):
        base = base.removesuffix(sfx)
    base = re.sub(r"_\d+[a-z]?$", "", base)
    return base


def classify_bones(name: str, bone_names: list[str]) -> tuple[list[str], list[str]]:
    family = extract_family(name)
    entity = [b for b in bone_names if b.startswith(family)]
    shared = [b for b in bone_names if not b.startswith(family)]
    return entity, shared


# ═══════════════════════════════════════════════════════════
# Java → Bedrock 转换
# ═══════════════════════════════════════════════════════════

def try_convert_java(name: str, geo_path: Path, cit_dir: str, dry_run: bool) -> Path | None:
    """尝试从 Java CIT 目录找到 {name}.json 并转换为 geo。返回 geo_path 或 None。"""
    java_dir = Path(cit_dir)
    java_file = java_dir / f"{name}.json"
    if not java_file.exists():
        java_file = java_dir / name  # 无后缀尝试
    if not java_file.exists():
        return None

    identifier = f"geometry.cit.{name}"

    if dry_run:
        print(f"[java] 找到 {java_file.name}，将转换为 geo")
        return geo_path

    model = json.loads(java_file.read_text(encoding="utf-8"))
    result = convert_java_to_bedrock(model, identifier=identifier)

    geo_path.parent.mkdir(parents=True, exist_ok=True)
    with open(geo_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent="\t", ensure_ascii=False)
        f.write("\n")

    bones = result["minecraft:geometry"][0]["bones"]
    total_cubes = sum(len(b["cubes"]) for b in bones)
    print(f"[java] {java_file.name} -> {geo_path.relative_to(ROOT)}  ({len(bones)} bones, {total_cubes} cubes)")
    return geo_path


# ═══════════════════════════════════════════════════════════
# 旋转 & 体素化
# ═══════════════════════════════════════════════════════════

def _make_rotation_fn(rot: list[float], pivot: list[float]):
    rx, ry, rz = [math.radians(a) for a in rot]

    if abs(rx) < 1e-9 and abs(rz) < 1e-9:
        if abs(ry) < 1e-9:
            return lambda p: p
        if abs(ry - math.pi) < 1e-9:
            return lambda p: [-p[0] + 2*pivot[0], p[1], -p[2] + 2*pivot[2]]
        if abs(ry - math.pi/2) < 1e-9:
            return lambda p: [p[2] - pivot[2] + pivot[0], p[1], -p[0] + pivot[0] + pivot[2]]
        if abs(ry + math.pi/2) < 1e-9:
            return lambda p: [-p[2] + pivot[2] + pivot[0], p[1], p[0] - pivot[0] + pivot[2]]

    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    R = [
        [cy*cz, cz*sx*sy - cx*sz, cx*cz*sy + sx*sz],
        [cy*sz, cx*cz + sx*sy*sz, -cz*sx + cx*sy*sz],
        [-sy,   cy*sx,            cx*cy],
    ]
    def general_rot(p):
        dx, dy, dz = p[0]-pivot[0], p[1]-pivot[1], p[2]-pivot[2]
        return [
            R[0][0]*dx + R[0][1]*dy + R[0][2]*dz + pivot[0],
            R[1][0]*dx + R[1][1]*dy + R[1][2]*dz + pivot[1],
            R[2][0]*dx + R[2][1]*dy + R[2][2]*dz + pivot[2],
        ]
    return general_rot


def voxelize_geo(geo_path: Path) -> set[tuple[int,int,int]]:
    data = json.loads(geo_path.read_text(encoding="utf-8"))
    voxels: set[tuple[int,int,int]] = set()

    for bone in data["minecraft:geometry"][0]["bones"]:
        rot = bone.get("rotation", [0, 0, 0])
        pivot = bone.get("pivot", [0, 0, 0])
        rot_fn = _make_rotation_fn(rot, pivot)

        for cube in bone.get("cubes", []):
            ox, oy, oz = cube["origin"]
            sx, sy, sz = cube["size"]
            corners = [
                [ox, oy, oz], [ox+sx, oy, oz], [ox, oy+sy, oz], [ox, oy, oz+sz],
                [ox+sx, oy+sy, oz], [ox+sx, oy, oz+sz], [ox, oy+sy, oz+sz], [ox+sx, oy+sy, oz+sz],
            ]
            rotated = [rot_fn(c) for c in corners]
            x_min = math.floor(min(c[0] for c in rotated))
            x_max = math.ceil(max(c[0] for c in rotated))
            y_min = math.floor(min(c[1] for c in rotated))
            y_max = math.ceil(max(c[1] for c in rotated))
            z_min = math.floor(min(c[2] for c in rotated))
            z_max = math.ceil(max(c[2] for c in rotated))

            for x in range(x_min, x_max):
                for y in range(y_min, y_max):
                    for z in range(z_min, z_max):
                        voxels.add((x, y, z))

    return voxels


# ═══════════════════════════════════════════════════════════
# 碰撞箱计算
# ═══════════════════════════════════════════════════════════

def compute_collision(voxels: set[tuple[int,int,int]]) -> dict:
    if not voxels:
        return {
            "collision_box": {"width": 0.5, "height": 0.0625},
            "hitboxes": [{"width": 0.5, "height": 0.0625, "pivot": [0, 0.03125, 0]}],
        }

    ys = [v[1] for v in voxels]
    layers: dict[int, set[tuple[int,int]]] = defaultdict(set)
    for (x, y, z) in voxels:
        layers[y].add((x, z))

    areas = {y: len(cells) for y, cells in layers.items()}
    max_area = max(areas.values())

    top_y = max(ys)
    for y in range(max(ys), min(ys) - 1, -1):
        if areas.get(y, 0) >= max_area * 0.5:
            top_y = y
            break

    bottom_y = min(ys)
    for y in range(min(ys), max(ys) + 1):
        if areas.get(y, 0) >= max_area * 0.5:
            bottom_y = y
            break

    height_cubes = top_y - bottom_y + 1
    height = round(height_cubes / 16, 6)

    x_spans: list[int] = []
    z_spans: list[int] = []
    body_voxels: list[tuple[int,int,int]] = []

    for y in range(bottom_y, top_y + 1):
        cells = layers.get(y, set())
        if cells:
            cx = [c[0] for c in cells]
            cz = [c[1] for c in cells]
            x_spans.append(max(cx) - min(cx) + 1)
            z_spans.append(max(cz) - min(cz) + 1)
            body_voxels.extend((c[0], y, c[1]) for c in cells)

    x_spans.sort()
    z_spans.sort()
    mid = len(x_spans) // 2
    median_x = x_spans[mid] if x_spans else 1
    median_z = z_spans[mid] if z_spans else 1
    width_cubes = max(median_x, median_z)
    width = round(width_cubes / 16, 6)

    bx = [v[0] for v in body_voxels]
    bz = [v[2] for v in body_voxels]
    center_x = (min(bx) + max(bx)) / 2
    center_y = (bottom_y + top_y) / 2
    center_z = (min(bz) + max(bz)) / 2

    return {
        "collision_box": {"width": width, "height": height},
        "hitboxes": [{
            "width": width,
            "height": height,
            "pivot": [round(-center_x / 16, 5), round(center_y / 16, 5), round(center_z / 16, 5)],
        }],
    }


# ═══════════════════════════════════════════════════════════
# 生成器
# ═══════════════════════════════════════════════════════════

def build_behavior(name: str, cit_type: str, geo_path: Path, dry_run: bool) -> str:
    src = ROOT / BEHAVIOR_TEMPLATES[cit_type]
    base = BEHAVIOR_BASE_NAMES[cit_type]
    text = src.read_text(encoding="utf-8")
    behavior = json.loads(text.replace(base, name))

    voxels = voxelize_geo(geo_path)
    col = compute_collision(voxels)
    comps = behavior["minecraft:entity"]["components"]
    comps["minecraft:collision_box"] = col["collision_box"]
    comps["minecraft:custom_hit_test"] = {"hitboxes": col["hitboxes"]}

    output = json.dumps(behavior, indent=2, ensure_ascii=False) + "\n"
    dst = ROOT / OUTPUT["behavior"].format(name=name)

    print(f"[col] width={col['collision_box']['width']}, height={col['collision_box']['height']}, "
          f"pivot={col['hitboxes'][0]['pivot']}")
    _write("behavior", dst, output, dry_run)
    return output


def build_client_entity(name: str, bone_names: list[str], cit_type: str, dry_run: bool) -> str:
    if len(bone_names) == 1:
        desc: dict = {
            "identifier": f"cit:{name}",
            "materials": {"default": "entity_alphatest"},
            "textures": {"default": f"textures/cit/entity/{name}"},
            "geometry": {"default": f"geometry.cit.{name}"},
            "render_controllers": [f"controller.render.cit.{name}"],
        }
    else:
        materials = {bn: "entity_alphatest" for bn in bone_names}
        textures = {bn: f"textures/cit/entity/{bn}" for bn in bone_names}
        controllers = [f"controller.render.cit.{name}.{bn}" for bn in bone_names]
        desc = {
            "identifier": f"cit:{name}",
            "materials": materials,
            "textures": textures,
            "geometry": {"default": f"geometry.cit.{name}"},
            "render_controllers": controllers,
        }

    if cit_type == "top":
        desc["animations"] = {name: f"animation.cit.{name}"}
        desc["scripts"] = {"animate": [name]}

    obj = {
        "format_version": "1.21.50",
        "minecraft:client_entity": {"description": desc},
    }
    output = json.dumps(obj, indent=2, ensure_ascii=False) + "\n"
    dst = ROOT / OUTPUT["client"].format(name=name)
    _write("client", dst, output, dry_run)
    return output


def build_render_controller(name: str, bone_names: list[str], dry_run: bool) -> str:
    controllers = {}

    if len(bone_names) == 1:
        controllers[f"controller.render.cit.{name}"] = {
            "geometry": "Geometry.default",
            "materials": [{"*": "Material.default"}],
            "textures": ["Texture.default"],
            "is_hurt_color": {"r": 0, "g": 0, "b": 0, "a": 0},
            "on_fire_color": {"r": 0, "g": 0, "b": 0, "a": 0},
            "ignore_lighting": False,
        }
    else:
        for bn in bone_names:
            visibility = [{b: (b == bn)} for b in bone_names]
            controllers[f"controller.render.cit.{name}.{bn}"] = {
                "geometry": "Geometry.default",
                "materials": [{"*": f"Material.{bn}"}],
                "textures": [f"Texture.{bn}"],
                "part_visibility": visibility,
                "is_hurt_color": {"r": 0, "g": 0, "b": 0, "a": 0},
                "on_fire_color": {"r": 0, "g": 0, "b": 0, "a": 0},
                "ignore_lighting": False,
            }

    obj = {"format_version": "1.8.0", "render_controllers": controllers}
    output = json.dumps(obj, indent=4, ensure_ascii=False) + "\n"
    dst = ROOT / OUTPUT["rc"].format(name=name)
    _write("rc", dst, output, dry_run)
    return output


def build_animation(name: str, bone_names: list[str], cit_type: str, dry_run: bool) -> None:
    bones = {}
    for bn in bone_names:
        bones[bn] = {
            "rotation": [0, "q.property('cit:wall_rotation')", 0],
            "position": [0, "math.sin(q.life_time * 1080) * q.property('cit:bounce') * 0.5", 0],
        }

    anim_entry = {
        f"animation.cit.{name}": {
            "loop": True,
            "bones": bones,
        }
    }

    anim_path = ROOT / ANIMATION_FILE
    if not anim_path.exists():
        raise FileNotFoundError(f"animation 共享文件不存在: {anim_path}")

    data = json.loads(anim_path.read_text(encoding="utf-8"))

    if dry_run:
        preview = json.dumps(anim_entry, indent=2, ensure_ascii=False)
        print(f"[dry-run] animation   -> 追加到 {anim_path.relative_to(ROOT)}")
        print(f"          entry: animation.cit.{name} ({len(bones)} bones)")
        json.loads(preview)
        return

    existing = data.get("animations", {})
    anim_key = f"animation.cit.{name}"
    if anim_key in existing:
        raise FileExistsError(f"animation {anim_key} 已在 {anim_path} 中存在，跳过以避免覆盖。")

    data["animations"][anim_key] = anim_entry[anim_key]
    output = json.dumps(data, indent=4, ensure_ascii=False) + "\n"
    anim_path.write_text(output, encoding="utf-8")
    print(f"[OK] animation   -> 追加 {anim_key} ({len(bones)} bones) 到 {anim_path.relative_to(ROOT)}")


def _write(label: str, dst: Path, content: str, dry_run: bool):
    if dry_run:
        print(f"[dry-run] {label:<11} -> {dst.relative_to(ROOT)}")
        json.loads(content)
    else:
        if dst.exists():
            raise FileExistsError(f"{dst} 已存在，为防止覆盖已终止。")
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(content, encoding="utf-8")
        print(f"[OK] {label:<11} -> {dst.relative_to(ROOT)}")


# ═══════════════════════════════════════════════════════════
# 主流程
# ═══════════════════════════════════════════════════════════

def generate(name: str, cit_type: str = "default", geo_override: str | None = None,
             dry_run: bool = False, no_convert: bool = False, cit_dir: str = JAVA_CIT_DIR):
    name = validate_name(name)

    # 自动类型检测
    if cit_type == "auto":
        cit_type = auto_detect_type(name)

    # 1) 尝试 Java → geo 转换
    geo_path = ROOT / GEO_SEARCH_DIR / f"{name}.geo.json"
    if geo_override:
        geo_path = Path(geo_override)
        if not geo_path.is_absolute():
            geo_path = ROOT / geo_path

    if not geo_path.exists() and not no_convert:
        converted = try_convert_java(name, geo_path, cit_dir, dry_run)
        if converted:
            geo_path = converted

    # 2) 解析 geo
    if not geo_path.exists():
        raise FileNotFoundError(
            f"geo 文件不存在: {geo_path}\n"
            f"请确保 Java 模型在 CIT 目录下，或用 -g 指定已有 geo 文件，或用 -C 跳过转换。"
        )

    data = json.loads(geo_path.read_text(encoding="utf-8"))
    bones = data["minecraft:geometry"][0]["bones"]
    bone_names = [b["name"] for b in bones]
    bone_names.sort(key=lambda bn: (bn != name, bn))

    entity_bones, shared_bones = classify_bones(name, bone_names)
    print(f"[geo] {len(bone_names)} 骨骼: {', '.join(bone_names)}  ({geo_path.relative_to(ROOT)})")
    if shared_bones:
        print(f"      实体: {', '.join(entity_bones)}  |  共享: {', '.join(shared_bones)}")

    # 3) 生成文件
    build_behavior(name, cit_type, geo_path, dry_run)
    build_client_entity(name, bone_names, cit_type, dry_run)
    build_render_controller(name, bone_names, dry_run)

    if cit_type == "top":
        build_animation(name, bone_names, cit_type, dry_run)


def main():
    parser = argparse.ArgumentParser(
        description="CIT 实体全套生成器 (Java 转换 + geo 解析 + 实体生成)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="示例:\n"
               "  python generate_cit.py baked_potato_0           # 全自动\n"
               "  python generate_cit.py -t top raw_chicken_0_top  # 指定类型\n"
               "  python generate_cit.py -n apple_0                 # 预览\n"
               "  python generate_cit.py -C -g custom.geo.json name # 跳过转换",
    )
    parser.add_argument("names", nargs="+", help="实体名，如 baked_potato_0 (可多个)")
    parser.add_argument("-t", "--type", choices=["default", "top", "auto"], default="auto",
                        help="实体类型 (默认 auto: 自动从名称检测 _top 后缀)")
    parser.add_argument("-n", "--dry-run", action="store_true", help="仅预览不写入")
    parser.add_argument("-g", "--geo", default=None, help="指定 geo 文件路径 (跳过自动查找)")
    parser.add_argument("-C", "--no-convert", action="store_true",
                        help="跳过 Java → geo 自动转换步骤")
    parser.add_argument("--cit-dir", default=JAVA_CIT_DIR,
                        help="Java CIT 模型目录 (默认使用 java_to_bedrock 的内置路径)")
    args = parser.parse_args()

    errors = []
    for name in args.names:
        try:
            generate(name, cit_type=args.type, geo_override=args.geo,
                     dry_run=args.dry_run, no_convert=args.no_convert,
                     cit_dir=args.cit_dir)
        except (ValueError, FileNotFoundError, FileExistsError) as e:
            print(f"[FAIL] {name}: {e}", file=sys.stderr)
            errors.append(name)

    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()