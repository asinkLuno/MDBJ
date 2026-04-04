"""
拉取沪深300指数日线数据（20231231 至今）并保存为 CSV。
使用 baostock（免费，无需 Token）。
"""

import baostock as bs
import pandas as pd

lg = bs.login()
print(f"baostock 登录: {lg.error_msg}")

rs = bs.query_history_k_data_plus(
    code="sh.000300",
    fields="date,open,high,low,close,volume,amount,pctChg",
    start_date="2023-12-31",
    end_date="2026-04-05",
    frequency="d",
    adjustflag="3",  # 不复权
)
if rs is None:
    raise RuntimeError("baostock query returned None")

rows = []
while rs.next():  # type: ignore[reportOptionalMemberAccess]
    rows.append(rs.get_row_data())  # type: ignore[reportOptionalMemberAccess]

bs.logout()

df = pd.DataFrame(rows, columns=rs.fields)  # type: ignore[reportOptionalMemberAccess]
for col in ["open", "high", "low", "close", "volume", "amount", "pctChg"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

out_path = "hs300_20231231_20260405.csv"
df.to_csv(out_path, index=False)

print(f"共获取 {len(df)} 条记录，已保存至 {out_path}")
print(df.to_string(max_rows=10))
