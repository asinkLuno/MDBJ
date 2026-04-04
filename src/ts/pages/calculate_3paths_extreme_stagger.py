import math
import os
import random
import re

random.seed(42)


def bezier(t, p0, p1, p2, p3):
    return (
        (1 - t) ** 3 * p0
        + 3 * (1 - t) ** 2 * t * p1
        + 3 * (1 - t) * t**2 * p2
        + t**3 * p3
    )


def tangent(t, p0, p1, p2, p3):
    return (
        3 * (1 - t) ** 2 * (p1 - p0)
        + 6 * (1 - t) * t * (p2 - p1)
        + 3 * t**2 * (p3 - p2)
    )


all_labels = [
    "台中",
    "高雄",
    "香港",
    "北京",
    "深圳",
    "太原",
    "武漢",
    "成都",
    "上海",
    "桃園",
    "新加坡",
    "雪梨",
    "拉斯維加斯",
    "天津",
    "香港",
    "杭州",
    "哈爾濱",
    "臺北",
    "北京",
    "上海",
    "貴陽",
    "長沙",
    "鄭州",
    "廈門",
    "上海",
    "廣州",
    "台中",
    "馬來西亞",
    "香港",
    "北京",
    "臺北",
]

# Four paths converging at top-right (1330, 100).
# Path B is the main diagonal — drawn as the visible trajectory line.
paths = [
    [(0, 500), (350, 450), (900, 350), (1330, 100)],  # Path A: left-upper
    [(0, 700), (400, 750), (950, 450), (1330, 100)],  # Path B: left-middle (main)
    [(100, 950), (450, 950), (950, 550), (1330, 100)],  # Path C: bottom-left
    [(600, 950), (800, 900), (1100, 600), (1330, 100)],  # Path D: bottom-mid
]

# More on A/B (spread wide), fewer on C/D (bottom paths converge faster)
counts = [8, 10, 7, 6]  # total = 31
t_maxs = [0.78, 0.82, 0.95, 0.72]

# Smaller stagger for C/D: their curves start nearly horizontal,
# so large perpendicular offset pushes planes off-screen vertically.
stagger_ranges = [
    (40, 100),  # Path A
    (40, 100),  # Path B
    (30, 70),  # Path C
    (30, 70),  # Path D
]

# --- Generate raw plane positions ---
raw = []  # [x, y, rot, label]
current_idx = 0

for p_idx, p in enumerate(paths):
    count = counts[p_idx]
    t_min = 0.05
    t_max = t_maxs[p_idx]
    lo, hi = stagger_ranges[p_idx]

    interval = (t_max - t_min) / max(1, count - 1)
    jitter = interval * 0.35
    base_ts = [t_min + i * interval for i in range(count)]
    ts = sorted(
        max(t_min, min(t_max, bt + random.uniform(-jitter, jitter))) for bt in base_ts
    )

    for t in ts:
        label = all_labels[current_idx]
        current_idx += 1

        bx = bezier(t, p[0][0], p[1][0], p[2][0], p[3][0])
        by = bezier(t, p[0][1], p[1][1], p[2][1], p[3][1])

        tx_v = tangent(t, p[0][0], p[1][0], p[2][0], p[3][0])
        ty_v = tangent(t, p[0][1], p[1][1], p[2][1], p[3][1])
        mag = math.sqrt(tx_v**2 + ty_v**2)
        nx, ny = -ty_v / mag, tx_v / mag

        stagger_mag = random.uniform(lo, hi)
        stagger = stagger_mag if random.random() > 0.5 else -stagger_mag
        stagger *= 1 - t * 0.7

        bx += random.uniform(-15, 15) + nx * stagger
        by += random.uniform(-15, 15) + ny * stagger

        bx = max(50, min(1330, bx))
        by = max(50, min(940, by))

        angle = math.atan2(ty_v, tx_v) * 180 / math.pi
        rot = int(angle + 180)

        raw.append([bx, by, rot, label])

# --- Repulsion pass: push overlapping planes apart ---
MIN_DIST = 160  # px — planes are 185px wide, need decent clearance

for _ in range(200):
    for i in range(len(raw)):
        for j in range(i + 1, len(raw)):
            dx = raw[j][0] - raw[i][0]
            dy = raw[j][1] - raw[i][1]
            dist = math.sqrt(dx * dx + dy * dy)
            if 0 < dist < MIN_DIST:
                push = (MIN_DIST - dist) / 2
                px, py = dx / dist * push, dy / dist * push
                raw[i][0] -= px
                raw[i][1] -= py
                raw[j][0] += px
                raw[j][1] += py

# Clamp after repulsion
for r in raw:
    r[0] = max(50, min(1330, r[0]))
    r[1] = max(50, min(940, r[1]))

# --- Build plane lines ---
plane_lines = [
    f"  {{ file: PLANE, label: '{r[3]}', x: {int(r[0]):4}, y: {int(r[1]):4}, w: 200, rot: {r[2]:3} }},"
    for r in raw
]

# --- Build replacement blocks ---
planes_block = (
    "const planes: SpreadPhotoLayout[] = [\n" + "\n".join(plane_lines) + "\n" + "];"
)

traj_block = "const trajectories: PageConfig['trajectories'] = [];"

# --- Write into page-03.ts ---
script_dir = os.path.dirname(os.path.abspath(__file__))
ts_path = os.path.join(script_dir, "page-03.ts")

with open(ts_path, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r"const planes: SpreadPhotoLayout\[\] = \[[\s\S]*?\];",
    planes_block,
    content,
)
content = re.sub(
    r"const trajectories: PageConfig\['trajectories'\] = \[[\s\S]*?\];",
    traj_block,
    content,
)

with open(ts_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Written {len(plane_lines)} planes to {ts_path}")
