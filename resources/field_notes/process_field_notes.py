import numpy as np
from PIL import Image, ImageFilter


def extract_content(path):
    img = Image.open(path).convert("RGB")
    data = np.array(img).astype(float)
    r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]

    # 1. 检测绿色
    green_mask = (g - r > 10) & (g - b > 10)

    # 2. 计算边界 (在抹除 21 之前计算，以保留原始的构图和顶部空间)
    rows = np.any(green_mask, axis=1)
    cols = np.any(green_mask, axis=0)
    
    row_indices = np.where(rows)[0]
    col_indices = np.where(cols)[0]
    
    if len(row_indices) == 0 or len(col_indices) == 0:
        print(f"Warning: No content detected in {path}. Returning blank.")
        return Image.new("RGB", img.size, (255, 255, 255))

    rmin, rmax = row_indices[[0, -1]]
    cmin, cmax = col_indices[[0, -1]]

    # 3. 针对 b.png 特殊处理：抹除右上角的噪声 (21)
    if "b." in path.lower():
        h_full, w_full = green_mask.shape
        # 抹除顶部 15% 和 右侧 20% 的交集区域
        green_mask[:int(h_full * 0.15), int(w_full * 0.80):] = False

    # 4. 根据先前计算的原始边界进行裁切
    green_crop = green_mask[rmin : rmax + 1, cmin : cmax + 1]

    # 5. 膨胀腐蚀（闭合）填补断点
    mask_img = Image.fromarray(green_crop.astype(np.uint8) * 255, "L")
    for _ in range(3):
        mask_img = mask_img.filter(ImageFilter.MaxFilter(3))
    for _ in range(2):
        mask_img = mask_img.filter(ImageFilter.MinFilter(3))
    filled = np.array(mask_img) > 127

    crop_data = data[rmin : rmax + 1, cmin : cmax + 1].astype(np.uint8)
    result = np.full_like(crop_data, 255)
    
    # 6. 提取内容并与白色混合 (调浅)
    content_pixels = crop_data[filled].astype(float)
    lightened = (content_pixels * 0.6 + 255 * 0.4).astype(np.uint8)
    result[filled] = lightened
    
    return Image.fromarray(result)


def process(inputs, margin_ratio=0.05, target_min_long_side=3840):
    """
    保持原图比例，但将长边放大到 3840px (4K)。
    四周添加基于长边比例的白边。
    """
    contents = [extract_content(p) for p in inputs]

    output_paths = []
    for path, content in zip(inputs, contents):
        w, h = content.size
        
        # 计算放大倍率，使长边达到 3840
        upscale = max(1.0, target_min_long_side / max(w, h))
        
        new_w, new_h = int(w * upscale), int(h * upscale)
        content = content.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # 边距 (基于 4K 尺寸的 5%)
        pad = int(target_min_long_side * margin_ratio)
        canvas_w, canvas_h = new_w + 2 * pad, new_h + 2 * pad

        # 创建白色画布
        canvas = Image.new("RGB", (canvas_w, canvas_h), (255, 255, 255))
        
        # 居中放置
        canvas.paste(content, (pad, pad))

        stem = path.rsplit(".", 1)[0]
        out_path = stem + "_final.png"
        canvas.save(out_path)
        print(f"saved: {out_path} (Canvas: {canvas_w}x{canvas_h}, Content: {new_w}x{new_h})")
        output_paths.append(out_path)

    return output_paths


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("usage: python process_field_notes.py <image1> [image2 ...]")
        sys.exit(1)
    process(sys.argv[1:])
