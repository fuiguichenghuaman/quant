"""
MACD 指标 - 主脚本

功能：
  1. 读取股票 CSV 数据
  2. 计算 MACD 三列：DIF、DEA、BAR
  3. 画出 DIF 线、DEA 线和红绿柱状图

运行方式：
  cd content/01-stock-analysis/03-macd-indicator
  pip install pandas matplotlib
  python main.py

依赖：
  pip install pandas matplotlib
"""

import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# -------------------------------------------------------
# 数据文件路径：相对于当前脚本，定位到 data/demo.csv
# -------------------------------------------------------
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"


def read_stock_data():
    """从 CSV 读取股票数据"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    df = df[["date", "close", "open", "high", "low", "volume"]]
    df["date"] = pd.to_datetime(df["date"])
    return df


def calc_macd(df, fastperiod=12, slowperiod=26, signalperiod=9):
    """
    计算 MACD 指标

    参数:
        df: 包含 close 列的 DataFrame
        fastperiod: 快线 EMA 周期，默认 12
        slowperiod: 慢线 EMA 周期，默认 26
        signalperiod: DEA 平滑周期，默认 9

    返回:
        新增 dif、dea、bar 三列的 DataFrame
    """
    # 计算 12 日指数移动平均（快线）
    ewma12 = df["close"].ewm(span=fastperiod, adjust=False).mean()

    # 计算 26 日指数移动平均（慢线）
    ewma26 = df["close"].ewm(span=slowperiod, adjust=False).mean()

    # DIF = 快线 - 慢线
    df["dif"] = ewma12 - ewma26

    # DEA = DIF 的 9 日指数移动平均
    df["dea"] = df["dif"].ewm(span=signalperiod, adjust=False).mean()

    # BAR = (DIF - DEA) * 2，柱状图的值
    df["bar"] = (df["dif"] - df["dea"]) * 2

    return df


def plot_macd():
    """
    画 MACD 图

    包含：
    - DIF 线（蓝色）
    - DEA 线（红色）
    - 红绿柱状图（BAR > 0 红色，BAR <= 0 绿色）
    """
    df = read_stock_data()
    df_macd = calc_macd(df)

    print("=== MACD 数据预览 ===")
    print(df_macd[["date", "close", "dif", "dea", "bar"]].head(10))

    # 设置中文字体
    plt.rcParams["axes.unicode_minus"] = False
    plt.rcParams["font.sans-serif"] = ["SimHei"]

    plt.figure(figsize=(12, 6))

    # 画 DIF 线和 DEA 线
    df_macd["dea"].plot(color="red", label="dea")
    df_macd["dif"].plot(color="blue", label="dif")
    plt.legend(loc="best")

    # 分别收集正柱子和负柱子
    pos_bar = []
    pos_index = []
    neg_bar = []
    neg_index = []

    for index, row in df_macd.iterrows():
        if row["bar"] > 0:
            pos_bar.append(row["bar"])
            pos_index.append(index)
        else:
            neg_bar.append(row["bar"])
            neg_index.append(index)

    # 大于 0 用红色表示
    plt.bar(pos_index, pos_bar, width=0.5, color="red")
    # 小于等于 0 用绿色表示
    plt.bar(neg_index, neg_bar, width=0.5, color="green")

    # 设置横坐标
    major_index = df_macd.index[df_macd.index]
    major_xtics = df_macd["date"][df_macd.index]
    plt.xticks(major_index, major_xtics)
    plt.setp(plt.gca().get_xticklabels(), rotation=30)

    plt.grid(linestyle="-.")
    plt.title("MACD Indicator")
    plt.tight_layout()

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / "macd.png", dpi=100)
    plt.close()
    print("Chart saved to output/macd.png")


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  MACD 指标 - 计算并画图")
    print("=" * 50)

    plot_macd()

    print("\n" + "=" * 50)
    print("  运行完毕！图表已保存到 output/ 目录")
    print("=" * 50)
