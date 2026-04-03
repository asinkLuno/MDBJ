import numpy as np
from PIL import Image

# 4x4 Bayer 矩阵（归一化到 0~1）
BAYER_4X4 = (
    np.array(
        [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5],
        ],
        dtype=np.float32,
    )
    / 16.0
)


def bayer_dither_2bit(img_gray: np.ndarray) -> np.ndarray:
    """
    2-bit Bayer 有序抖动：将灰度图量化为 4 级灰（0, 85, 170, 255）
    """
    levels = 4
    h, w = img_gray.shape

    bayer_tiled = np.tile(BAYER_4X4, (h // 4 + 1, w // 4 + 1))[:h, :w]
    normalized = img_gray.astype(np.float32) / 255.0
    dithered = normalized + (bayer_tiled - 0.5) / levels
    quantized = np.clip(np.round(dithered * (levels - 1)), 0, levels - 1)
    output = (quantized / (levels - 1) * 255).astype(np.uint8)

    return output


def pad_to_3x4(img: Image.Image) -> Image.Image:
    """将图像补白边至 3:4 比例（宽:高）"""
    w, h = img.size
    target_w = max(w, h * 3 // 4)
    target_h = max(h, w * 4 // 3)
    if target_w * 4 > target_h * 3:
        target_h = target_w * 4 // 3
    else:
        target_w = target_h * 3 // 4

    if target_w == w and target_h == h:
        return img

    new_img = Image.new(img.mode, (target_w, target_h), 255)
    offset_x = (target_w - w) // 2
    offset_y = (target_h - h) // 2
    new_img.paste(img, (offset_x, offset_y))
    return new_img


def main():
    input_path = "resources/鸟巢.jpg"
    output_path = "resources/鸟巢_dithered.png"
    pad = False

    img = Image.open(input_path).convert("L")
    w_orig, h_orig = img.size
    size_tuple = (int(w_orig * 300 / h_orig), 300)
    if pad:
        img = pad_to_3x4(img)
    img = img.resize(size_tuple, Image.Resampling.LANCZOS)
    arr = np.array(img)

    result = bayer_dither_2bit(arr)

    Image.fromarray(result).save(output_path)
    print(f"saved → {output_path}")

    unique_values = np.unique(result)
    print(f"gray levels in output: {unique_values}")


if __name__ == "__main__":
    main()
