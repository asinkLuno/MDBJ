import cv2
import numpy as np

# 1. 读取图像（使用 cv2.IMREAD_UNCHANGED 保留可能存在的透明 Alpha 通道）

image = cv2.imread("resources/虾片/mayday_logo.png", cv2.IMREAD_UNCHANGED)


if image is None:
    print("错误：无法读取图像，请检查文件路径。")

else:
    radius = 50

    # 2. 检查图像是否为 4 通道 (包含透明度)

    if len(image.shape) == 3 and image.shape[2] == 4:
        print("检测到 4 通道图像，正在处理所有通道...")

        # 拆分通道：前3个是 BGR，最后1个是 Alpha

        bgr_image = image[:, :, :3]

        alpha_channel = image[:, :, 3]

        # 使用 GaussianBlur 对 BGR 和 Alpha 通道都进行模糊

        # 这样边缘和内容都会变模糊，效果更明显

        kernel_size = (radius * 2 + 1, radius * 2 + 1)

        bgr_blurred = cv2.GaussianBlur(bgr_image, kernel_size, 0)

        alpha_blurred = cv2.GaussianBlur(alpha_channel, kernel_size, 0)

        # 重新组合 4 通道

        guided_blurred = np.dstack([bgr_blurred, alpha_blurred])

    else:
        # 如果是普通的 3 通道或单通道图片，直接处理

        print("检测到 3 通道或单通道图像，直接处理...")

        kernel_size = (radius * 2 + 1, radius * 2 + 1)

        guided_blurred = cv2.GaussianBlur(image, kernel_size, 0)

    # 3. 保存并展示

    # 注意：这里我们依然保存为 'guided_mayday_logo.png' 以兼容原来的文件名，但实际是高斯模糊

    cv2.imwrite("resources/虾片/guided_mayday_logo.png", guided_blurred)

    print("✅ 模糊处理完成，已保存为 'guided_mayday_logo.png'")
