"""
Pandas 股票数据基础 - 主脚本

功能：
  1. 读取 CSV 股票数据，观察表格信息和统计概况
  2. 日期列处理：字符串转 datetime，提取年份和月份
  3. 找最小收盘价及对应整行
  4. 按月份分组统计平均收盘价和开盘价
  5. 计算涨跌额和涨跌比例

运行方式：
  cd content/01-stock-analysis/04-pandas-basics
  pip install pandas matplotlib
  python main.py

依赖：
  pandas matplotlib
"""

import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

# -------------------------------------------------------
# 数据文件路径：相对于当前脚本，定位到 data/demo.csv
# -------------------------------------------------------
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"


def read_file():
    """读取 CSV 文件，查看表格基本信息和统计概况"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    print("=== DataFrame 基本信息 ===")
    print(df.info())
    print("----------------------------------------------")
    print("=== 统计概况 ===")
    print(df.describe())
    return df


def process_time():
    """把日期列从字符串转成 datetime，并提取年份和月份"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month

    print("=== 带年月列的 DataFrame ===")
    print(df)
    return df


def find_close_min():
    """找出最小收盘价、所在行号、以及对应整行数据"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    print("=== 最小收盘价 ===")
    print("close min : {}".format(df["close"].min()))
    print("close min index : {}".format(df["close"].idxmin()))
    print("close min frame :\n{}".format(df.loc[df["close"].idxmin()]))
    return df


def monthly_mean():
    """按月份分组，计算每月平均收盘价和平均开盘价"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.month

    print("=== 每月平均收盘价 ===")
    print(df.groupby("month")["close"].mean())
    print("\n=== 每月平均开盘价 ===")
    print(df.groupby("month")["open"].mean())
    return df


def calc_rise_ratio():
    """计算涨跌额和涨跌比例"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df["date"] = pd.to_datetime(df["date"])
    df["rise"] = df["close"].diff()
    df["rise_ratio"] = df["rise"] / df["close"].shift(1)

    print("=== 涨跌额与涨跌比例 ===")
    print(df)
    return df


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  Pandas 股票数据基础 - 运行所有分析")
    print("=" * 50)

    read_file()
    print()
    process_time()
    print()
    find_close_min()
    print()
    monthly_mean()
    print()
    calc_rise_ratio()

    print("\n" + "=" * 50)
    print("  全部运行完毕！")
    print("=" * 50)
