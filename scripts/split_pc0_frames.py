"""
将 pc_0.png 16×32 精灵图垂直切分为两个 16×16 帧。

用法:
  python scripts/split_pc0_frames.py
  python scripts/split_pc0_frames.py --input path/to/pc_0.png --out-dir path/to/output
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("需要 Pillow 库: pip install pillow")
    sys.exit(1)


def split_sprite(input_path: str, out_dir: str, frame_w: int = 16, frame_h: int = 16):
    img = Image.open(input_path)
    w, h = img.size

    if w != frame_w or h % frame_h != 0:
        print(f"警告: 图片尺寸 {w}×{h}，预期 {frame_w}×{frame_h}*N 的垂直精灵图")
        # 允许宽度不同的精灵图，按高度等分
        frame_count = h // frame_h
        actual_frame_h = frame_h
    else:
        frame_count = h // frame_h
        actual_frame_h = frame_h

    os.makedirs(out_dir, exist_ok=True)
    base_name = Path(input_path).stem

    for i in range(frame_count):
        top = i * actual_frame_h
        bottom = top + actual_frame_h
        frame = img.crop((0, top, w, bottom))
        out_name = f"{base_name}_s{i}.png"
        out_path = os.path.join(out_dir, out_name)
        frame.save(out_path)
        print(f"  → {out_name}")

    # 同时复制原图到输出目录（static 控制器需要）
    import shutil
    dest_original = os.path.join(out_dir, os.path.basename(input_path))
    if os.path.abspath(input_path) != os.path.abspath(dest_original):
        shutil.copy2(input_path, dest_original)
        print(f"  → {os.path.basename(input_path)} (原图复制)")

    print(f"完成: {frame_count} 帧已输出到 {out_dir}")


def main():
    ws_root = Path(__file__).resolve().parent.parent
    default_je_dir = ws_root.parent / "Mizunos 16 Craft JE CIT_1.20.1 （修复版）" / "assets" / "minecraft" / "optifine" / "cit"
    default_be_dir = ws_root / "resource_packs" / "Mizuno 16 Craft BE CIT" / "textures" / "cit" / "entity"

    parser = argparse.ArgumentParser(description="切分 pc_0 精灵图为独立帧")
    parser.add_argument("--input", "-i", default=str(default_je_dir / "pc_0.png"),
                        help=f"输入精灵图路径（默认: JE CIT 目录下的 pc_0.png）")
    parser.add_argument("--out-dir", "-o", default=str(default_be_dir),
                        help=f"输出目录（默认: BE entity 纹理目录）")
    parser.add_argument("--frame-w", type=int, default=16, help="帧宽度（默认 16）")
    parser.add_argument("--frame-h", type=int, default=16, help="帧高度（默认 16）")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"错误: 输入文件不存在: {args.input}", file=sys.stderr)
        sys.exit(1)

    split_sprite(args.input, args.out_dir, args.frame_w, args.frame_h)


if __name__ == "__main__":
    main()