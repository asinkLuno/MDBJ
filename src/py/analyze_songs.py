"""
分析红歌/绿歌日期与沪深300涨跌的关联
用法：python src/py/analyze_songs.py
"""

import csv
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent


def load_hs300(path: Path) -> dict[str, float]:
    data = {}
    with open(path) as f:
        for row in csv.DictReader(f):
            data[row["date"]] = float(row["pctChg"])
    return data


def load_dates(path: Path) -> list[str]:
    return [line.strip() for line in path.read_text().splitlines() if line.strip()]


def fmt(d: str) -> str:
    return f"{d[:4]}-{d[4:6]}-{d[6:8]}"


def find_trading_day(d: str, hs300: dict[str, float]) -> tuple[str, float] | None:
    target = datetime.strptime(fmt(d), "%Y-%m-%d")
    for delta in range(4):
        for sign in [0] if delta == 0 else [-1, 1]:
            check = (target + timedelta(days=delta * sign)).strftime("%Y-%m-%d")
            if check in hs300:
                return check, hs300[check]
    return None


def analyze(
    dates: list[str], hs300: dict[str, float], label: str
) -> list[tuple[str, str, float]]:
    results = []
    for d in dates:
        r = find_trading_day(d, hs300)
        if r:
            results.append((d, r[0], r[1]))

    total = len(results)
    up = sum(1 for _, _, p in results if p > 0)
    pcts = [p for _, _, p in results]
    avg = sum(pcts) / total if total else 0

    print(f"=== {label} ===")
    print(
        f"样本: {total}  涨: {up} ({up/total*100:.1f}%)  跌: {total-up} ({(total-up)/total*100:.1f}%)"
    )
    print(f"平均涨跌幅: {avg:+.3f}%")

    by_year: dict[str, list[float]] = defaultdict(list)
    for rd, _, pct in results:
        by_year[rd[:4]].append(pct)
    for year in sorted(by_year):
        p = by_year[year]
        ups = sum(1 for x in p if x > 0)
        print(f"  {year}: {len(p)}条  涨{ups}跌{len(p)-ups}  均{sum(p)/len(p):+.3f}%")
    print()
    return results


def main():
    hs300_path = next(ROOT.glob("hs300_*.csv"))
    hs300 = load_hs300(hs300_path)
    print(f"HS300 数据：{hs300_path.name}，共 {len(hs300)} 个交易日\n")

    all_pct = list(hs300.values())
    all_up = sum(1 for p in all_pct if p > 0)
    print("=== 基准：全区间 ===")
    print(
        f"样本: {len(all_pct)}  涨: {all_up} ({all_up/len(all_pct)*100:.1f}%)  跌: {len(all_pct)-all_up} ({(len(all_pct)-all_up)/len(all_pct)*100:.1f}%)"
    )
    print(f"平均涨跌幅: {sum(all_pct)/len(all_pct):+.3f}%\n")

    red_r = analyze(load_dates(ROOT / "red_song.csv"), hs300, "红歌")
    green_r = analyze(load_dates(ROOT / "green_song.csv"), hs300, "绿歌")

    overlap = {r[0] for r in red_r} & {r[0] for r in green_r}
    print("=== 重叠交易日 ===")
    print(overlap if overlap else "无")


if __name__ == "__main__":
    main()
