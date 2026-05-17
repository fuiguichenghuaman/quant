"""
KDJ 指标计算与绘图 - 主脚本

功能：
  1. 从 CSV 读取股票数据
  2. 计算 KDJ 指标（K、D、J 三线）
  3. 绘制 KDJ 指标图并保存为图片

运行方式：
  cd content/01-stock-analysis/05-kdj-indicator
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


def cal_kdj(df):
    """
    计算 KDJ 指标

    参数:
        df: 包含 close、high、low 列的 DataFrame

    返回:
        新增 k、d、j 三列的 DataFrame
    """
    # 最近 9 天里的最低价
    low_list = df["low"].rolling(9, min_periods=9).min()
    # 前面不够 9 天时，用从开头到当前的最低值补齐
    low_list.fillna(value=df["low"].expanding().min(), inplace=True)

    # 最近 9 天里的最高价
    high_list = df["high"].rolling(9, min_periods=9).max()
    # 前面不够 9 天时，用从开头到当前的最高值补齐
    high_list.fillna(value=df["high"].expanding().max(), inplace=True)

    # RSV = (当前收盘价 - 最近9天最低价) / (最近9天最高价 - 最近9天最低价) * 100
    rsv = (df["close"] - low_list) / (high_list - low_list) * 100

    # K 值：对 RSV 做指数加权平滑
    df["k"] = pd.DataFrame(rsv).ewm(com=2).mean()
    # D 值：对 K 值再做一次平滑
    df["d"] = df["k"].ewm(com=2).mean()
    # J 值：3*K - 2*D，比 K 和 D 更敏感
    df["j"] = 3 * df["k"] - 2 * df["d"]

    return df


def plot_kdj():
    """读取数据、计算 KDJ、绘制并保存图表"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df = df[["date", "close", "open", "high", "low", "volume"]]
    df["date"] = pd.to_datetime(df["date"])

    df_kdj = cal_kdj(df)
    print(df_kdj)

    # 设置中文字体
    plt.rcParams["axes.unicode_minus"] = False
    plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "STSong"]

    plt.figure(figsize=(12, 6))

    df_kdj["k"].plot(color="red", label="K")
    df_kdj["d"].plot(color="yellow", label="D")
    df_kdj["j"].plot(color="blue", label="J")
    plt.legend(loc="best")

    # 设置横坐标为日期
    major_index = df_kdj.index[df_kdj.index]
    major_xtics = df_kdj["date"][df_kdj.index]
    plt.xticks(major_index, major_xtics)
    plt.setp(plt.gca().get_xticklabels(), rotation=30)

    plt.grid(linestyle="-.")
    plt.title("000001 平安银行 KDJ 图")

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)
    plt.tight_layout()
    plt.savefig(output_dir / "kdj.png", dpi=150)
    plt.close()
    print("Chart saved to output/kdj.png")

    return df_kdj


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  KDJ 指标计算与绘图")
    print("=" * 50)

    plot_kdj()

    print("\n" + "=" * 50)
    print("  运行完毕！图表已保存到 output/ 目录")
    print("=" * 50)
