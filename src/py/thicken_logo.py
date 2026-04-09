from pathlib import Path

import cv2
import numpy as np


def thicken_image(input_path: str, output_path: str, thickness: int = 10):
    """
    使用 OpenCV 膨胀 Alpha 通道来加粗透明 PNG 图标。
    thickness: 加粗半径（像素）。
    """
    # 读取图像，使用 IMREAD_UNCHANGED 保留 Alpha 通道
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

    if img is None:
        print(f"错误: 无法读取图像 {input_path}")
        return

    if len(img.shape) == 3 and img.shape[2] == 4:
        # 处理带 Alpha 通道的图像
        _, _, _, a = cv2.split(img)

        # 结构元素：使用圆形 kernel 效果更平滑
        kernel_size = thickness * 2 + 1
        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE, (kernel_size, kernel_size)
        )

        # 对 Alpha 通道进行膨胀
        dilated_alpha = cv2.dilate(a, kernel, iterations=1)

        # 确保 RGB 通道在新增区域也是黑色 (0, 0, 0)
        # 如果 logo 不是纯黑的，这里可能需要不同的逻辑
        new_b = np.zeros_like(dilated_alpha)
        new_g = np.zeros_like(dilated_alpha)
        new_r = np.zeros_like(dilated_alpha)

        result = cv2.merge([new_b, new_g, new_r, dilated_alpha])
    else:
        # 处理普通灰度或 RGB 图像（假设黑字白底）
        kernel_size = thickness * 2 + 1
        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE, (kernel_size, kernel_size)
        )
        # 腐蚀 (Erode) 会让暗色区域扩大，即加粗
        result = cv2.erode(img, kernel, iterations=1)

    cv2.imwrite(output_path, result)
    print(f"✓ 已生成加粗图像: {output_path}")


if __name__ == "__main__":
    # 定位路径
    current_dir = Path(__file__).parent
    project_root = current_dir.parent.parent

    input_file = project_root / "resources" / "虾片" / "mayday_logo.png"
    output_file = project_root / "resources" / "虾片" / "mayday_logo_bold.png"

    thicken_image(str(input_file), str(output_file), thickness=5)
