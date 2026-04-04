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


# List of (city, sublabel) tuples — duplicates allowed, order preserved.
all_labels = [
    ("台中", "231231  240101\n240102  240105\n240106  240107"),
    ("高雄", "240323  240324\n240329  240330\n240331"),
    ("香港", "240430  240503\n240504  240505\n240507  240508\n240509"),
    (
        "北京",
        "240518  240519\n240521  240522\n240524  240525\n240526  240530\n240531  240601",
    ),
    ("深圳", "240701  240702\n240703  240705\n240706  240707"),
    ("太原", "240731  240802\n240803  240804"),
    ("武漢", "240906  240907\n240908  240910\n240911"),
    ("成都", "240927  240928\n240930  241004"),
    (
        "上海",
        "241210  241212\n241213  241215\n241216  241217\n241219  241220\n241222  241223\n241224",
    ),
    ("桃園", "241228  241229\n241231  250101\n250104  250105"),
    ("新加坡", "250111  250112"),
    ("雪梨", "250222"),
    ("拉斯維加斯", "250329"),
    ("天津", "250418  250419\n250420"),
    ("香港", "250509  250510\n250511  250513"),
    ("杭州", "250523  250524\n250525  250527\n250528"),
    ("哈爾濱", "250613  250614\n250615"),
    ("臺北", "250627  250628\n250629  250704\n250705  250706\n250711  250712"),
    (
        "北京",
        "250725  250726\n250727  250801\n250802  250803\n250806  250808\n250809  250810\n250815  250816\n250817",
    ),
    ("上海", "250902  250903\n250904  250910"),
    ("貴陽", "250912  250913\n250914"),
    ("長沙", "250919  250920\n250921"),
    ("鄭州", "251017  251018\n251019"),
    ("廈門", "251024  251025\n251026"),
    ("上海", "251108  251109\n251110  251114\n251115  251116"),
    ("廣州", "251205  251206\n251207  251212\n251214  251215"),
    ("台中", "251227  251228\n251231  260101\n260103  260104"),
    ("馬來西亞", "260131"),
    ("香港", "260324  260325\n260327  260328\n260329"),
    (
        "北京",
        "260430  260501\n260502  260503\n260508  260509\n260510  260511\n260515  260516\n260517  260518",
    ),
    ("臺北", "coming soon..."),
]

# Four paths converging at top-right (1220, 100).
# Plane image is 1811×1405 → aspect ~0.776; at w=200 the rendered height ≈ 155px.
# Worst-case rotated bounding-box half-widths/heights near the convergence (~130-160°):
#   half-width  ≈ 123px   →  x_max = 1360 - 130 = 1230  (use 1220 for safety)
#   half-height ≈ 107px   →  y_max = 1036 - 110 = 926   (use 920 for safety)
# Left-edge safety: at rot~170°, rotated half-width ≈ 112px → x_min_clamp = 200
# P0/P1 shifted right so paths don't start at the canvas edge.
# Path B is the main diagonal — drawn as the visible trajectory line.
paths = [
    [(120, 500), (370, 450), (900, 350), (1220, 100)],  # Path A: left-upper
    [(120, 700), (420, 750), (950, 450), (1220, 100)],  # Path B: left-middle (main)
    [(130, 950), (460, 950), (950, 550), (1220, 100)],  # Path C: bottom-left
    [(620, 920), (810, 880), (1100, 580), (1220, 100)],  # Path D: bottom-mid
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
        city, dates = all_labels[current_idx]
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

        bx = max(80, min(1220, bx))
        by = max(50, min(920, by))

        angle = math.atan2(ty_v, tx_v) * 180 / math.pi
        rot = int(angle + 180)

        raw.append([bx, by, rot, city, dates])

# --- Repulsion pass: push overlapping planes apart ---
MIN_DIST = 175  # px — planes are 200px wide; 175 gives ~12% clearance

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
    r[0] = max(80, min(1220, r[0]))
    r[1] = max(50, min(920, r[1]))


# --- Build plane lines ---
def plane_entry(r):
    escaped = (
        r[4].replace("\t", "\\t").replace("\n", "\\n")
    )  # tabs + newlines as literal \t \n in TS string
    sublabel_part = f", sublabel: '{escaped}'" if escaped else ""
    return f"  {{ file: PLANE, label: '{r[3]}'{sublabel_part}, x: {int(r[0]):4}, y: {int(r[1]):4}, w: 200, rot: {r[2]:3} }},"


plane_lines = [plane_entry(r) for r in raw]

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
    lambda _: planes_block,
    content,
)
content = re.sub(
    r"const trajectories: PageConfig\['trajectories'\] = \[[\s\S]*?\];",
    lambda _: traj_block,
    content,
)

with open(ts_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Written {len(plane_lines)} planes to {ts_path}")
