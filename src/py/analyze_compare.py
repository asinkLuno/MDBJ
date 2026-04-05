import pandas as pd
from scipy import stats

# 1. 加载数据
try:
    hs300_df = pd.read_csv('hs300_20231231_20260405.csv')
    hs300_df['date'] = pd.to_datetime(hs300_df['date'])
    trading_dates = sorted(hs300_df['date'].unique())

    def get_nearest_trading_day(target_date):
        for td in trading_dates:
            if td >= target_date:
                return td
        return None

    def analyze_file(file_path, label):
        dates_raw = pd.read_csv(file_path, header=None, names=['date'], dtype=str)
        dates_raw['date'] = pd.to_datetime(dates_raw['date'], format='%Y%m%d')
        dates_raw['matched_date'] = dates_raw['date'].apply(get_nearest_trading_day)
        matched_dates = dates_raw['matched_date'].dropna().unique()
        performance = hs300_df[hs300_df['date'].isin(matched_dates)]['pctChg'].dropna()
        return performance

    red_perf = analyze_file('red_song.csv', 'Red')
    green_perf = analyze_file('green_song.csv', 'Green')
    all_perf = hs300_df['pctChg'].dropna()

except Exception as e:
    print(f"数据处理失败: {e}")
    exit(1)

# 2. 统计计算
def get_stats(perf, all_p):
    t_stat, p_val = stats.ttest_ind(perf, all_p, equal_var=False)
    return {
        "样本数": len(perf),
        "平均涨跌幅": f"{perf.mean():.4f}%",
        "中位数": f"{perf.median():.4f}%",
        "上涨概率": f"{(perf > 0).mean()*100:.2f}%",
        "标准差": f"{perf.std():.4f}",
        "P-值": f"{p_val:.4f}"
    }

stats_all = get_stats(all_perf, all_perf) # 基准的P值无意义
stats_red = get_stats(red_perf, all_perf)
stats_green = get_stats(green_perf, all_perf)

# 3. 输出对比表
df_compare = pd.DataFrame({
    "指标": ["样本数", "平均涨跌幅", "中位数", "上涨概率", "标准差", "P-值"],
    "全样本 (基准)": [len(all_perf), f"{all_perf.mean():.4f}%", f"{all_perf.median():.4f}%", f"{(all_perf > 0).mean()*100:.2f}%", f"{all_perf.std():.4f}", "-"],
    "红歌日期 (Red)": [stats_red[k] for k in ["样本数", "平均涨跌幅", "中位数", "上涨概率", "标准差", "P-值"]],
    "绿歌日期 (Green)": [stats_green[k] for k in ["样本数", "平均涨跌幅", "中位数", "上涨概率", "标准差", "P-值"]]
})

print("========== 沪深300指数对比分析报告 ==========")
print(df_compare.to_string(index=False))

print("\n结论摘要：")
if float(stats_red["P-值"]) < 0.05:
    print("- 红歌日期与指数表现有显著统计联系（P < 0.05）。")
else:
    print("- 红歌日期表现更接近随机波动。")

if float(stats_green["P-值"]) < 0.05:
    print("- 绿歌日期与指数表现有显著统计联系（P < 0.05）。")
else:
    print("- 绿歌日期表现更接近随机波动。")
