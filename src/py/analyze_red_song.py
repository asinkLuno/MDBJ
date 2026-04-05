import numpy as np
import pandas as pd
from scipy import stats

# 1. 加载数据
try:
    hs300_df = pd.read_csv("hs300_20231231_20260405.csv")
    # red_song.csv 没有表头，格式为 YYYYMMDD
    red_dates_raw = pd.read_csv("red_song.csv", header=None, names=["date"], dtype=str)
except Exception as e:
    print(f"读取文件失败: {e}")
    exit(1)

# 2. 预处理日期
hs300_df["date"] = pd.to_datetime(hs300_df["date"])
red_dates_raw["date"] = pd.to_datetime(red_dates_raw["date"], format="%Y%m%d")

# 3. 匹配交易日 (红歌日期可能在周末)
trading_dates = sorted(hs300_df["date"].unique())


def get_nearest_trading_day(target_date):
    # 寻找不小于目标日期的第一个交易日
    for td in trading_dates:
        if td >= target_date:
            return td
    return None


red_dates_raw["matched_date"] = red_dates_raw["date"].apply(get_nearest_trading_day)
# 移除无法匹配的日期（超出范围）
matched_dates = list(red_dates_raw["matched_date"].dropna().unique())

# 4. 提取表现数据
# 红歌相关交易日的表现
matched_mask = hs300_df["date"].isin(matched_dates)
red_pct = hs300_df[matched_mask]["pctChg"]
red_performance = red_pct.dropna()  # type: ignore
# 全样本表现（基准）
all_performance = hs300_df["pctChg"].dropna()

# 5. 统计分析
results = {
    "样本数量 (红歌日期匹配)": len(red_performance),
    "全样本交易日数量": len(all_performance),
    "红歌日平均涨跌幅 (%)": red_performance.mean(),
    "全样本平均涨跌幅 (%)": all_performance.mean(),
    "红歌日中位数 (%)": red_performance.median(),
    "全样本中位数 (%)": all_performance.median(),
    "红歌日上涨概率 (%)": (red_performance > 0).mean() * 100,
    "全样本上涨概率 (%)": (all_performance > 0).mean() * 100,
    "红歌日标准差": red_performance.std(),
    "全样本标准差": all_performance.std(),
}

# T-检验 (Welch's t-test，不假设方差相等)
ttest_result = stats.ttest_ind(red_performance, all_performance, equal_var=False)
t_stat = ttest_result[0]
p_value = ttest_result[1]

# 6. 输出结果
print("========== 统计分析结果 ==========")
for k, v in results.items():
    if "%" in k:
        print(f"{k}: {v:.2f}%")
    else:
        print(f"{k}: {v:.4f}" if isinstance(v, (float, np.float64)) else f"{k}: {v}")

print(f"\nT-统计量: {t_stat:.4f}")
print(f"P-值: {p_value:.4f}")

if p_value < 0.05:  # type: ignore
    print(
        "\n结论：在 0.05 的显著性水平下，红歌日期与指数表现存在【显著】的统计学联系。"
    )
else:
    print(
        "\n结论：P-值较大 (>0.05)，未能发现红歌日期与指数表现之间存在显著的统计学联系。"
    )
