import numpy as np
from PIL import Image, ImageFilter


def extract_content(path):
    img = Image.open(path).convert("RGB")
    data = np.array(img).astype(float)
    r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]

    # 1. 检测绿色
    green_mask = (g - r > 10) & (g - b > 10)

    # 2. 内容边界检测，裁掉空白边缘
    rows = np.any(green_mask, axis=1)
    cols = np.any(green_mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    green_crop = green_mask[rmin : rmax + 1, cmin : cmax + 1]

    # 3. 膨胀腐蚀（闭合）填补断点
    mask_img = Image.fromarray(green_crop.astype(np.uint8) * 255, "L")
    for _ in range(3):
        mask_img = mask_img.filter(ImageFilter.MaxFilter(3))
    for _ in range(2):
        mask_img = mask_img.filter(ImageFilter.MinFilter(3))
    filled = np.array(mask_img) > 127

    crop_data = data[rmin : rmax + 1, cmin : cmax + 1].astype(np.uint8)
    result = np.full_like(crop_data, 255)
    result[filled] = crop_data[filled]
    return Image.fromarray(result)


def process(inputs, pad=40):
    """
    inputs: list of file paths
    以第一张图的内容尺寸为基准，其余图按比例缩放到相同高度，
    统一加白边后输出。

    输出文件名：原文件名去掉扩展名 + '_final.png'，保存在同目录下。
    """
    contents = [extract_content(p) for p in inputs]
    target_w, target_h = contents[0].size

    canvas_w = target_w + pad * 2
    canvas_h = target_h + pad * 2

    output_paths = []
    for path, content in zip(inputs, contents):
        w, h = content.size
        scale = min(target_w / w, target_h / h)
        if scale != 1.0:
            content = content.resize(
                (int(w * scale), int(h * scale)), Image.Resampling.LANCZOS
            )
        w, h = content.size

        canvas = Image.new("RGB", (canvas_w, canvas_h), (255, 255, 255))
        ox = (canvas_w - w) // 2
        oy = (canvas_h - h) // 2
        canvas.paste(content, (ox, oy))

        stem = path.rsplit(".", 1)[0]
        out_path = stem + "_final.png"
        canvas.save(out_path)
        print(f"saved: {out_path}  (content {w}x{h}, canvas {canvas_w}x{canvas_h})")
        output_paths.append(out_path)

    return output_paths


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("usage: python process_field_notes.py <image1> [image2 ...]")
        sys.exit(1)
    process(sys.argv[1:])
