"""
综合技术指标图 - 主脚本

功能：
  1. 从 CSV 读取股票数据
  2. 计算均线（MA5、MA10）
  3. 计算 MACD（DIF、DEA、BAR）
  4. 计算 KDJ（K、D、J）
  5. 绘制四区域综合图：K线+均线、成交量、MACD、KDJ
  6. 保存图片到 output/ 目录

运行方式：
  cd content/01-stock-analysis/06-all-indicators
  pip install pandas matplotlib mplfinance
  python main.py

依赖：
  pandas matplotlib mplfinance
"""

import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from mplfinance.original_flavor import candlestick2_ochl

# -------------------------------------------------------
# 文件路径
# -------------------------------------------------------
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
OUTPUT_FILE = Path(__file__).resolve().parent / "output" / "all_indicators_chart.png"


def load_price_data():
    """读取并整理基础价格数据"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    df = df[["date", "close", "open", "high", "low", "volume"]].copy()
    df["date"] = pd.to_datetime(df["date"])
    # 给每一行分配整数横坐标位置
    df["x"] = range(len(df))
    # 把日期转换成适合横坐标显示的文字
    df["date_label"] = df["date"].dt.strftime("%Y-%m-%d")
    return df


def cal_ma(df, ma_periods=(5, 10)):
    """计算均线"""
    for period in ma_periods:
        df[f"ma{period}"] = df["close"].rolling(period).mean()
    return df


def cal_macd(df, fastperiod=12, slowperiod=26, signalperiod=9):
    """计算 MACD"""
    ewma12 = df["close"].ewm(span=fastperiod, adjust=False).mean()
    ewma26 = df["close"].ewm(span=slowperiod, adjust=False).mean()
    df["dif"] = ewma12 - ewma26
    df["dea"] = df["dif"].ewm(span=signalperiod, adjust=False).mean()
    df["bar"] = (df["dif"] - df["dea"]) * 2
    return df


def cal_kdj(df):
    """计算 KDJ"""
    low_list = df["low"].rolling(9, min_periods=9).min()
    low_list.fillna(value=df["low"].expanding().min(), inplace=True)

    high_list = df["high"].rolling(9, min_periods=9).max()
    high_list.fillna(value=df["high"].expanding().max(), inplace=True)

    rsv = (df["close"] - low_list) / (high_list - low_list) * 100
    df["k"] = pd.DataFrame(rsv).ewm(com=2).mean()
    df["d"] = df["k"].ewm(com=2).mean()
    df["j"] = 3 * df["k"] - 2 * df["d"]
    return df


def build_up_down_colors(df):
    """根据涨跌准备红绿颜色列表"""
    return ["red" if close >= open_price else "green" for close, open_price in zip(df["close"], df["open"])]


def plot_all_indicators():
    """绘制综合技术指标图并保存"""
    # 设置中文字体
    plt.rcParams["axes.unicode_minus"] = False
    plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "STSong"]

    # 第一步：读取并整理基础价格数据
    df = load_price_data()
    # 第二步：计算均线
    df = cal_ma(df, ma_periods=(5, 10))
    # 第三步：计算 MACD
    df = cal_macd(df)
    # 第四步：计算 KDJ
    df = cal_kdj(df)

    print(df[["date", "close", "ma5", "ma10", "dif", "dea", "bar", "k", "d", "j"]])

    # 准备颜色
    volume_colors = build_up_down_colors(df)
    macd_colors = ["red" if bar > 0 else "green" for bar in df["bar"]]

    # 创建 4 个上下排列的子图区域
    fig, (ax_price, ax_volume, ax_macd, ax_kdj) = plt.subplots(
        4,
        1,
        figsize=(16, 12),
        sharex=True,
        gridspec_kw={"height_ratios": [4, 1.6, 2.2, 2.2], "hspace": 0.08},
    )
    fig.patch.set_facecolor("#f7f9fc")

    # 统一美化 4 个子图
    for ax in (ax_price, ax_volume, ax_macd, ax_kdj):
        ax.set_facecolor("white")
        ax.grid(linestyle="-.", alpha=0.35)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)

    # === 顶部：蜡烛图 + 均线 ===
    candlestick2_ochl(
        ax=ax_price,
        opens=df["open"].values,
        closes=df["close"].values,
        highs=df["high"].values,
        lows=df["low"].values,
        width=0.65,
        colorup="red",
        colordown="green",
        alpha=0.9,
    )
    ax_price.plot(df["x"], df["ma5"], color="#f59e0b", linewidth=1.4, label="MA5")
    ax_price.plot(df["x"], df["ma10"], color="#2563eb", linewidth=1.4, label="MA10")
    ax_price.set_ylabel("价格")
    ax_price.set_title("000001 平安银行 技术指标综合图", fontsize=15, pad=12)
    ax_price.legend(loc="upper left")

    # === 第二块：成交量 ===
    ax_volume.bar(df["x"], df["volume"], color=volume_colors, width=0.6, alpha=0.8)
    ax_volume.set_ylabel("成交量")

    # === 第三块：MACD ===
    ax_macd.plot(df["x"], df["dif"], color="#2563eb", linewidth=1.2, label="DIF")
    ax_macd.plot(df["x"], df["dea"], color="#ef4444", linewidth=1.2, label="DEA")
    ax_macd.bar(df["x"], df["bar"], color=macd_colors, width=0.6, alpha=0.55, label="BAR")
    ax_macd.axhline(0, color="#64748b", linewidth=0.9)
    ax_macd.set_ylabel("MACD")
    ax_macd.legend(loc="upper left", ncol=3)

    # === 第四块：KDJ ===
    ax_kdj.plot(df["x"], df["k"], color="#ef4444", linewidth=1.2, label="K")
    ax_kdj.plot(df["x"], df["d"], color="#eab308", linewidth=1.2, label="D")
    ax_kdj.plot(df["x"], df["j"], color="#2563eb", linewidth=1.2, label="J")
    ax_kdj.axhline(80, color="#94a3b8", linewidth=0.9, linestyle="--")
    ax_kdj.axhline(20, color="#94a3b8", linewidth=0.9, linestyle="--")
    ax_kdj.set_ylabel("KDJ")
    ax_kdj.legend(loc="upper left", ncol=3)

    # 设置横坐标日期
    tick_step = 1 if len(df) <= 20 else max(1, len(df) // 10)
    tick_positions = df["x"][::tick_step]
    tick_labels = df["date_label"][::tick_step]
    ax_kdj.set_xticks(tick_positions)
    ax_kdj.set_xticklabels(tick_labels, rotation=30, ha="right")

    # 保存图片
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUTPUT_FILE, dpi=220, bbox_inches="tight")
    plt.close()
    print(f"图像已保存到: {OUTPUT_FILE}")

    return df


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  综合技术指标图 - 运行所有分析")
    print("=" * 50)

    plot_all_indicators()

    print("\n" + "=" * 50)
    print("  全部运行完毕！图表已保存到 output/ 目录")
    print("=" * 50)
