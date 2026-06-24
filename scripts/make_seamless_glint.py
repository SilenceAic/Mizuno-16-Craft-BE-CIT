"""
预处理 glint 纹理：旋转 30° + 全向无缝平铺。

算法：拉普拉斯金字塔多分辨率混合 (Burt & Adelson 1983)
- 构建原图 + 偏移图的高斯金字塔 (逐级降采样)
- 转为拉普拉斯金字塔 (差值 = 本层 - 上采样下层)
- mask 也构建高斯金字塔，在每层分别混合拉普拉斯分量
- 从最粗层逐级上采样重建 → 低频用宽过渡，高频保留锐度

流程：
1. 原图无缝化 (拉普拉斯金字塔)
2. 3×3 平铺 → 旋转 30° → 居中裁剪
3. 裁剪结果再次无缝化 (拉普拉斯金字塔)
"""

from PIL import Image
import numpy as np
import os
import sys


def _downsample(arr: np.ndarray) -> np.ndarray:
    """2×2 均值降采样。输入 (H, W, C) 输出 (H/2, W/2, C)。"""
    h, w = arr.shape[:2]
    h2, w2 = h // 2, w // 2
    # 分别取偶行偶列、奇行偶列等 4 组取平均
    return (
        arr[0 : h2 * 2 : 2, 0 : w2 * 2 : 2]
        + arr[1 : h2 * 2 : 2, 0 : w2 * 2 : 2]
        + arr[0 : h2 * 2 : 2, 1 : w2 * 2 : 2]
        + arr[1 : h2 * 2 : 2, 1 : w2 * 2 : 2]
    ) * 0.25


def _upsample(arr: np.ndarray, target_h: int, target_w: int) -> np.ndarray:
    """最近邻上采样到目标尺寸 (双倍扩 + 裁剪)。"""
    h, w = arr.shape[:2]
    if h == target_h and w == target_w:
        return arr
    # 每个像素扩展为 2×2
    up = np.repeat(np.repeat(arr, 2, axis=0), 2, axis=1)
    return up[:target_h, :target_w]


def _build_gaussian_pyramid(arr: np.ndarray, levels: int) -> list:
    """构建高斯金字塔，每级尺寸减半。返回 list[arr_0, arr_1, ... arr_{levels-1}]"""
    pyramid = [arr]
    for _ in range(levels - 1):
        pyramid.append(_downsample(pyramid[-1]))
    return pyramid


def _build_laplacian_pyramid(gauss_pyr: list) -> list:
    """从高斯金字塔构建拉普拉斯金字塔。L_k = G_k - upsample(G_{k+1})，末层 L_last = G_last"""
    lap_pyr = []
    for k in range(len(gauss_pyr) - 1):
        coarse_up = _upsample(gauss_pyr[k + 1], gauss_pyr[k].shape[0], gauss_pyr[k].shape[1])
        lap_pyr.append(gauss_pyr[k] - coarse_up)
    lap_pyr.append(gauss_pyr[-1])  # 最粗层保持原值
    return lap_pyr


def _reconstruct_from_laplacian(lap_pyr: list) -> np.ndarray:
    """从拉普拉斯金字塔重建图像。从最粗层逐级上采样累加。"""
    result = lap_pyr[-1]
    for k in range(len(lap_pyr) - 2, -1, -1):
        result = _upsample(result, lap_pyr[k].shape[0], lap_pyr[k].shape[1])
        result = result + lap_pyr[k]
    return np.clip(result, 0, 255)


def _make_mask(h: int, w: int) -> np.ndarray:
    """生成圆形渐变 mask (单通道)：中心=0，四角=1，smoothstep。"""
    x = np.arange(w, dtype=np.float32)
    y = np.arange(h, dtype=np.float32)
    dist_x = np.abs(x - w / 2.0) / (w / 2.0)
    dist_y = np.abs(y - h / 2.0) / (h / 2.0)
    mask = np.sqrt(dist_x[np.newaxis, :] ** 2 + dist_y[:, np.newaxis] ** 2)
    mask = mask / np.sqrt(2.0)
    mask = np.clip(mask / 0.55, 0.0, 1.0)  # 混合带比例
    mask = mask * mask * (3.0 - 2.0 * mask)
    return mask


def make_seamless_laplacian(arr: np.ndarray, pyramid_levels: int = 6) -> np.ndarray:
    """
    拉普拉斯金字塔多分辨率无缝化。

    每通道独立处理，mask 在各分辨率层级控制原图 vs 偏移图的混合比例。
    """
    h, w = arr.shape[:2]
    offset_arr = np.roll(np.roll(arr, h // 2, axis=0), w // 2, axis=1)

    # 构建全分辨率 mask
    mask_full = _make_mask(h, w)
    mask_full = mask_full.astype(np.float32)

    result_channels = []
    for c in range(arr.shape[2]):
        ch_a = arr[:, :, c].astype(np.float32)
        ch_b = offset_arr[:, :, c].astype(np.float32)

        gauss_a = _build_gaussian_pyramid(ch_a, pyramid_levels)
        gauss_b = _build_gaussian_pyramid(ch_b, pyramid_levels)
        gauss_m = _build_gaussian_pyramid(mask_full, pyramid_levels)

        lap_a = _build_laplacian_pyramid(gauss_a)
        lap_b = _build_laplacian_pyramid(gauss_b)

        # 在各层级混合拉普拉斯分量
        lap_blend = []
        for k in range(pyramid_levels):
            m = gauss_m[k]  # (H, W) 2D，与单通道 lap 直接逐元素乘
            blended = lap_a[k] * m + lap_b[k] * (1.0 - m)
            lap_blend.append(blended)

        reconstructed = _reconstruct_from_laplacian(lap_blend)
        result_channels.append(reconstructed)

    result = np.stack(result_channels, axis=-1)
    return np.clip(result, 0, 255).astype(np.float32)


def tile_to_canvas(arr: np.ndarray, tiles: int = 3) -> np.ndarray:
    return np.tile(arr, (tiles, tiles, 1))


def rotate_and_crop(arr: np.ndarray, angle_deg: float, out_size: int) -> np.ndarray:
    img = Image.fromarray(arr.astype(np.uint8), "RGBA")
    rotated = img.rotate(angle_deg, resample=Image.Resampling.BILINEAR, expand=True)
    rw, rh = rotated.size
    left = (rw - out_size) // 2
    top = (rh - out_size) // 2
    cropped = rotated.crop((left, top, left + out_size, top + out_size))
    return np.array(cropped, dtype=np.float32)


def process(input_path: str, output_path: str, angle_deg: float = 30.0):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    arr = np.array(img, dtype=np.float32)
    levels = int(np.log2(min(w, h)))  # 128→7 levels

    # Step 1: 原图拉普拉斯无缝化
    arr = make_seamless_laplacian(arr, pyramid_levels=levels)
    print(f"  Step 1: laplacian seamless ({w}×{h})   {levels} levels")

    # Step 2: 3×3 平铺 + 旋转 + 裁剪
    large = tile_to_canvas(arr, tiles=3)
    cropped = rotate_and_crop(large, angle_deg, out_size=w)
    print(f"  Step 2: tiled → rotated {angle_deg}° → cropped ({w}×{w})")

    # Step 3: 裁剪结果拉普拉斯无缝化
    arr = make_seamless_laplacian(cropped, pyramid_levels=levels)
    print(f"  Step 3: laplacian seamless   {levels} levels")

    Image.fromarray(arr.astype(np.uint8), "RGBA").save(output_path)
    print(f"  Output: {output_path}")


if __name__ == "__main__":
    base = r"c:\Users\shuli\Mizuno-16-Craft-BE-CIT\resource_packs\Mizuno 16 Craft BE CIT\textures\misc"
    src = os.path.join(base, "enchanted_entity_glint_white.png")
    dst = os.path.join(base, "enchanted_entity_glint_white_seamless.png")

    if not os.path.exists(src):
        print(f"Source not found: {src}", file=sys.stderr)
        sys.exit(1)

    process(src, dst, angle_deg=30.0)
    print("Done.")