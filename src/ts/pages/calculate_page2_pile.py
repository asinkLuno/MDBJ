# pyright: reportUnknownLambdaType=false
"""
page-02: 「方形容器堆积」物理模拟。

左页面就是一个开口向上的矩形容器（REF: 680 × 1036）。
6 种脸各 5 份 = 30 个，从容器左侧逐个放入，堆积在左边多一些。
每种脸只有最靠上（最显眼）的那一个带 sublabel。

结果写入 page-02.ts 中的 `const pile: SpreadPhotoLayout[]`。
"""

import math
import os
import random
import re
import sys

try:
    import pymunk
except ImportError:
    print("pip install pymunk")
    sys.exit(1)

random.seed(42)

FACES = [
    "resources/虾片/ashin.png",
    "resources/虾片/masa.png",
    "resources/虾片/ming.png",
    "resources/虾片/monster.png",
    "resources/虾片/stone.png",
]
NAMES = {
    "resources/虾片/ashin.png": "Ashin\nVocal\n19751206",
    "resources/虾片/masa.png": "Masa\nBass\n19770425",
    "resources/虾片/ming.png": "Ming\nDrum\n19730728",
    "resources/虾片/monster.png": "Monster\nGuitar\n19761128",
    "resources/虾片/stone.png": "Stone\nGuitar\n19751211",
}
COPIES_PER_FACE = 5  # 30 total

# 容器 REF 尺寸（左页）
BOX_X0, BOX_X1 = 49, 631
BOX_Y0, BOX_Y1 = 6, 909  # 顶部开口，底部 = 958 (B6 REF_H)

FACE_RADIUS = 60  # 碰撞半径（对应显示宽度 100）
FACE_W = 120  # 统一显示宽度

# ── pymunk ────────────────────────────────────────────────────────────────────
space = pymunk.Space()
space.gravity = (0, 980)
space.damping = 0.35


def wall(a, b, e=0.25, f=0.8):
    seg = pymunk.Segment(space.static_body, a, b, 10)
    seg.elasticity = e
    seg.friction = f
    space.add(seg)


wall((BOX_X0, BOX_Y1), (BOX_X1, BOX_Y1))  # 底
wall((BOX_X0, BOX_Y0), (BOX_X0, BOX_Y1))  # 左壁
wall((BOX_X1, BOX_Y0), (BOX_X1, BOX_Y1))  # 右壁

# ── 逐个从左侧放入粒子 ────────────────────────────────────────────────────────
all_faces = FACES * COPIES_PER_FACE
random.shuffle(all_faces)

faces_data = []

# 每放一个球，先模拟 STEPS_PER_BALL 步让它落下稳定，再放下一个
STEPS_PER_BALL = 120

for i, face_file in enumerate(all_faces):
    body = pymunk.Body(1, pymunk.moment_for_circle(1, 0, FACE_RADIUS))

    # 贴着左壁投入
    sx = BOX_X0 + FACE_RADIUS + random.uniform(2, 15)
    sy = -(FACE_RADIUS + 10)
    body.position = (sx, sy)
    body.velocity = (random.uniform(10, 50), random.uniform(5, 30))
    body.angular_velocity = random.uniform(-1.5, 1.5)

    shape = pymunk.Circle(body, FACE_RADIUS)
    shape.elasticity = 0.15
    shape.friction = 0.85
    space.add(body, shape)
    faces_data.append({"body": body, "file": face_file})

    # 模拟这个球落入并基本稳定
    for _ in range(STEPS_PER_BALL):
        space.step(1 / 60.0)

# ── 阶段 2：强阻尼收尾，让整堆完全稳定 ──────────────────────────────────────
space.damping = 0.05
space.gravity = (0, 200)
for _ in range(300):
    space.step(1 / 60.0)

# ── 提取 ─────────────────────────────────────────────────────────────────────
raw = []
for fd in faces_data:
    body = fd["body"]
    px = max(BOX_X0 + FACE_RADIUS, min(BOX_X1 - FACE_RADIUS, body.position.x))
    py = max(-200, min(BOX_Y1 - FACE_RADIUS, body.position.y))
    rot = int(round(math.degrees(body.angle))) % 360
    raw.append([px, py, rot, fd["file"], FACE_W])

# 按 y 排序（y 小 = 偏上 = 后绘 = 显眼），底层先画
raw.sort(key=lambda r: r[1], reverse=True)

# 每种脸只给「最靠上」那一个（y 最小，即 raw 最后）打 sublabel 和 showFrame
labeled = set()
sublabels = {}
show_frame = set()
for r in reversed(raw):  # reversed → 从 y 最小（最靠上）开始
    key = r[3]
    if key not in labeled:
        sublabels[id(r)] = NAMES.get(key, "")
        show_frame.add(id(r))
        labeled.add(key)


# ── 生成 TS ───────────────────────────────────────────────────────────────────
def entry(r):
    name = sublabels.get(id(r), "")
    has_frame = id(r) in show_frame
    frame = "true" if has_frame else "false"
    corners = ", frameCornersOnly: true, frameSameDir: true" if has_frame else ""
    return (
        f"  {{ file: '{r[3]}', "
        f"x: {int(r[0]):4}, y: {int(r[1]):4}, "
        f"w: {r[4]}, rot: {r[2]:3}, "
        f"showFrame: {frame}, framePadX: 0, framePadY: 0, sublabel: '{name.replace(chr(10), r'\n')}'{corners} }},"
    )


lines = [entry(r) for r in raw]
block = "const pile: SpreadPhotoLayout[] = [\n" + "\n".join(lines) + "\n];"

script_dir = os.path.dirname(os.path.abspath(__file__))
ts_path = os.path.join(script_dir, "page-01.ts")

if os.path.exists(ts_path):
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = re.sub(
        r"const pile: SpreadPhotoLayout\[\] = \[[\s\S]*?\];",
        lambda _: block,
        content,
    )
    with open(ts_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"完成！{len(lines)} 个虾片写入 {ts_path}。")
else:
    print(f"找不到文件：{ts_path}")
