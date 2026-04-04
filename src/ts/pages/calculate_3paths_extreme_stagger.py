import math
import os
import random
import re
import sys

try:
    import pymunk
except ImportError:
    print("【提示】未检测到 pymunk。请先在终端运行以下命令安装：")
    print("pip install pymunk")
    sys.exit(1)

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


# List of (city, sublabel) tuples
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
    ("悉尼", "250222"),
    ("Las Vegas", "250329"),
    ("天津", "250418  250419\n250420"),
    ("香港", "250509  250510\n250511  250513"),
    ("杭州", "250523  250524\n250525  250527\n250528"),
    ("哈爾濱", "250613  250614\n250615"),
    ("臺北", "250627  250628\n250629  250704\n250705  250706\n250711  250712"),
    (
        "北京",
        "250725  250726  250727\n250801  250802  250803\n250806  250808  250809\n250810  250815  250816\n250817",
    ),
    ("上海", "250902  250903\n250904  250910"),
    ("貴陽", "250912  250913\n250914"),
    ("長沙", "250919  250920\n250921"),
    ("鄭州", "251017  251018\n251019"),
    ("廈門", "251024  251025\n251026"),
    ("上海", "251108  251109\n251110  251114\n251115  251116"),
    ("廣州", "251205  251206\n251207  251212\n251214  251215"),
    ("台中", "251227  251228\n251231  260101\n260103  260104"),
    ("吉隆坡", "260131"),
    ("香港", "260324  260325\n260327  260328\n260329"),
    (
        "北京",
        "260430  260501\n260502  260503\n260508  260509\n260510  260511\n260515  260516\n260517  260518",
    ),
    ("臺北", "coming soon..."),
]

# === 几何定义 ===
spine = [(60, 800), (650, 850), (1050, 550), (1280, 150)]
left_wall = [(-20, 500), (500, 550), (900, 300), (1280, 50)]
right_wall = [(60, 1050), (800, 1050), (1200, 700), (1280, 250)]

# 设定我们要强制锁定的终点坐标 (最尖端)
TARGET_TIP_POS = (1250, 160)

# === 物理引擎初始化 ===
space = pymunk.Space()
space.damping = 0.4


def add_bezier_wall(space, p0, p1, p2, p3):
    steps = 15
    prev = (
        bezier(0, p0[0], p1[0], p2[0], p3[0]),
        bezier(0, p0[1], p1[1], p2[1], p3[1]),
    )
    for i in range(1, steps + 1):
        t = i / steps
        curr = (
            bezier(t, p0[0], p1[0], p2[0], p3[0]),
            bezier(t, p0[1], p1[1], p2[1], p3[1]),
        )
        seg = pymunk.Segment(space.static_body, prev, curr, 15)
        seg.elasticity = 0.5
        seg.friction = 0.5
        space.add(seg)
        prev = curr


add_bezier_wall(space, *left_wall)
add_bezier_wall(space, *right_wall)

cap_top = pymunk.Segment(space.static_body, (1300, -20), (1300, 300), 20)
space.add(cap_top)

# === 投入飞机实体 ===
planes_data = []
total_planes = len(all_labels)

# 用来记录那一架需要被锁死的“臺北”飞机
anchor_body = None

for i, (city, dates) in enumerate(all_labels):
    t_spawn = 0.1 + (i / (total_planes - 1)) * 0.8

    lx = bezier(
        t_spawn, left_wall[0][0], left_wall[1][0], left_wall[2][0], left_wall[3][0]
    )
    ly = bezier(
        t_spawn, left_wall[0][1], left_wall[1][1], left_wall[2][1], left_wall[3][1]
    )
    rx = bezier(
        t_spawn, right_wall[0][0], right_wall[1][0], right_wall[2][0], right_wall[3][0]
    )
    ry = bezier(
        t_spawn, right_wall[0][1], right_wall[1][1], right_wall[2][1], right_wall[3][1]
    )

    spread_ratio = random.uniform(0.05, 0.95)
    spawn_x = lx * (1 - spread_ratio) + rx * spread_ratio
    spawn_y = ly * (1 - spread_ratio) + ry * spread_ratio

    body = pymunk.Body(1, math.inf)

    # 【核心逻辑】：识别特定的飞机
    if city == "臺北" and "coming soon" in dates:
        body.position = TARGET_TIP_POS
        anchor_body = body  # 存入变量，等下每一帧都要锁死它
    else:
        body.position = (spawn_x, spawn_y)

    shape = pymunk.Circle(body, 75)
    shape.elasticity = 0.1
    shape.friction = 0.7

    space.add(body, shape)
    planes_data.append({"body": body, "city": city, "dates": dates})

# === 两阶段物理模拟 ===

# 阶段一：吸引聚集
space.gravity = (550, -320)
for _ in range(450):
    # 强制让锚点飞机纹丝不动
    if anchor_body:
        anchor_body.position = TARGET_TIP_POS
        anchor_body.velocity = (0, 0)
    space.step(1 / 60.0)

# 阶段二：释放重叠 (舒展期)
space.gravity = (0, 0)
space.damping = 0.05
for _ in range(300):
    # 舒展期依然强制锁死，它会作为一堵“墙”把别的飞机往后推，确保自己绝对在最前面
    if anchor_body:
        anchor_body.position = TARGET_TIP_POS
        anchor_body.velocity = (0, 0)
    space.step(1 / 60.0)

# === 提取最终数据 ===
raw = []
for p in planes_data:
    body = p["body"]
    px, py = body.position.x, body.position.y
    city = p["city"]
    dates = p["dates"]

    t_approx = max(0.0, min(1.0, (px - spine[0][0]) / (spine[-1][0] - spine[0][0])))
    tx_v = tangent(t_approx, spine[0][0], spine[1][0], spine[2][0], spine[3][0])
    ty_v = tangent(t_approx, spine[0][1], spine[1][1], spine[2][1], spine[3][1])

    angle = math.atan2(ty_v, tx_v) * 180 / math.pi
    rot = int(angle + 180 + random.uniform(-8, 8))

    px = max(20, min(1320, px))
    py = max(20, min(1050, py))

    raw.append([px, py, rot, city, dates])


# === 生成 Typescript 代码 ===
def plane_entry(r):
    escaped = r[4].replace("\t", "\\t").replace("\n", "\\n")
    sublabel_part = f", sublabel: '{escaped}'" if escaped else ""
    return f"  {{ file: PLANE, label: '{r[3]}'{sublabel_part}, x: {int(r[0]):4}, y: {int(r[1]):4}, w: 160, rot: {r[2]:3} }},"


plane_lines = [plane_entry(r) for r in raw]
planes_block = (
    "const planes: SpreadPhotoLayout[] = [\n" + "\n".join(plane_lines) + "\n];"
)

traj_pts = []
for i in range(40):
    t = i / 39.0
    tx = bezier(t, spine[0][0], spine[1][0], spine[2][0], spine[3][0])
    ty = bezier(t, spine[0][1], spine[1][1], spine[2][1], spine[3][1])
    traj_pts.append(f"{{ x: {int(tx)}, y: {int(ty)} }}")

traj_points_str = ",\n    ".join(traj_pts)
traj_block = f"""const trajectories: PageConfig["trajectories"] = [
  {{
    points: [
    {traj_points_str}
    ],
    dash: [0, 8],
    lineWidth: 5,
    lineCap: "round",
    color: COLOR_DEFAULT,
  }},
];"""

# === 写入文件 ===
script_dir = os.path.dirname(os.path.abspath(__file__))
ts_path = os.path.join(script_dir, "page-03.ts")

if os.path.exists(ts_path):
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
    print(f"成功运行物理模拟！已将 {len(plane_lines)} 架飞机写入 {ts_path}。")
else:
    print(f"【注意】未能找到文件：{ts_path}，请确认路径是否正确。")
