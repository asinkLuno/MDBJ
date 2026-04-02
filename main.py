from PIL import Image
import numpy as np


# 4x4 Bayer 矩阵（归一化到 0~1）
BAYER_4X4 = np.array([
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5],
], dtype=np.float32) / 16.0


def bayer_dither_2bit(img_gray: np.ndarray) -> np.ndarray:
    """
    2-bit Bayer 有序抖动：将灰度图量化为 4 级灰（0, 85, 170, 255）

    原理：
      - 2-bit 有 4 个灰度级，每级跨度为 255/3 ≈ 85
      - 先将像素归一化到 [0, 1]
      - 加上 Bayer 矩阵的扰动（范围 ±1/levels），再量化到最近的级别
    """
    levels = 4  # 2-bit = 4 级
    h, w = img_gray.shape

    # 将 Bayer 矩阵平铺到图像大小
    bayer_tiled = np.tile(BAYER_4X4, (h // 4 + 1, w // 4 + 1))[:h, :w]

    # 归一化到 [0, 1]
    normalized = img_gray.astype(np.float32) / 255.0

    # 加入 Bayer 抖动扰动：范围是 [-0.5/levels, +0.5/levels] 的偏移
    # bayer 值在 [0, 1)，减去 0.5 后映射到 [-0.5, 0.5)，再除以 levels 缩放
    dithered = normalized + (bayer_tiled - 0.5) / levels

    # 量化到 4 级，再映射回 [0, 255]
    quantized = np.clip(np.round(dithered * (levels - 1)), 0, levels - 1)
    output = (quantized / (levels - 1) * 255).astype(np.uint8)

    return output


def main(size: tuple[int, int] | None = (300, 300)):
    input_path = "01.jpg"
    output_path = "output_2bit_bayer.png"

    img = Image.open(input_path).convert("L")  # 转为灰度
    if size is not None:
        img = img.resize(size, Image.LANCZOS)
    arr = np.array(img)

    result = bayer_dither_2bit(arr)

    Image.fromarray(result).save(output_path)
    print(f"saved → {output_path}")

    # 验证：输出中只应有 4 种灰度值
    unique_values = np.unique(result)
    print(f"gray levels in output: {unique_values}")


if __name__ == "__main__":
    main()
