import math
import random

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
    "杭州",
    "哈爾濱",
    "台北",
    "北京",
    "貴陽",
    "長沙",
    "鄭州",
    "廈門",
    "廣州",
    "馬來西亞",
]

paths = [
    [(0, 500), (400, 550), (900, 350), (1300, 100)],  # Path A: 8 planes
    [(50, 920), (500, 850), (1000, 450), (1300, 100)],  # Path B: 10 planes
    [(650, 940), (850, 900), (1150, 600), (1300, 100)],  # Path C: 6 planes
]

counts = [8, 10, 6]
t_maxs = [0.75, 0.98, 0.65]

results = []
current_idx = 0
for p_idx, p in enumerate(paths):
    count = counts[p_idx]
    t_max = t_maxs[p_idx]

    for i in range(count):
        label = all_labels[current_idx]
        current_idx += 1

        t = 0.05 + (i / max(1, count - 1)) * (t_max - 0.05)

        bx = bezier(t, p[0][0], p[1][0], p[2][0], p[3][0])
        by = bezier(t, p[0][1], p[1][1], p[2][1], p[3][1])

        tx = tangent(t, p[0][0], p[1][0], p[2][0], p[3][0])
        ty = tangent(t, p[0][1], p[1][1], p[2][1], p[3][1])
        mag = math.sqrt(tx**2 + ty**2)
        nx, ny = -ty / mag, tx / mag

        # INCREASED STAGGER: 90px
        stagger = 80 if i % 2 == 0 else -80

        # Converge stagger as t approaches 1
        current_stagger = stagger * (1 - (t * 0.5))

        bx += random.uniform(-5, 5) + nx * current_stagger
        by += random.uniform(-5, 5) + ny * current_stagger

        # Clamp to screen
        bx = max(50, min(1300, bx))
        by = max(50, min(950, by))

        angle = math.atan2(ty, tx) * 180 / math.pi
        rot = int(angle + 180)

        results.append(
            f"  {{ file: PLANE, label: '{label}', x: {int(bx):4}, y: {int(by):4}, w: 185, rot: {rot:3} }},"
        )

print("const planes: SpreadPhotoLayout[] = [")
for line in results:
    print(line)
print("];")
