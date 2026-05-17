"""
K 线图可视化 - 主脚本

功能：
  1. 基础 K 线图（使用 candlestick2_ochl）
  2. 带成交量的 K 线图（使用 mplfinance）
  3. 带成交量和均线的 K 线图（mav=[5, 10]）

运行方式：
  cd content/01-stock-analysis/02-kline-visualization
  pip install pandas matplotlib mplfinance
  python main.py

依赖：
  pip install pandas matplotlib mplfinance
"""

import pandas as pd
import matplotlib.pyplot as plt
import mplfinance as mpf
from pathlib import Path
from mplfinance.original_flavor import candlestick2_ochl

# -------------------------------------------------------
# 数据文件路径：相对于当前脚本，定位到 data/demo.csv
# -------------------------------------------------------
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"


def read_kline_data():
    """从 CSV 读取 K 线数据"""
    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    return df


def plot_simple_kline():
    """
    基础 K 线图

    用 candlestick2_ochl 画出最基本的 K 线图。
    重点是理解 K 线由 open/close/high/low 四列价格组成。
    """
    df = read_kline_data()

    fig = plt.figure()
    axes = fig.add_subplot(111)

    candlestick2_ochl(
        ax=axes,
        opens=df["open"].values,
        closes=df["close"].values,
        highs=df["high"].values,
        lows=df["low"].values,
        width=0.75,
        colorup="red",
        colordown="green",
    )

    plt.xticks(range(len(df.index.values)), df.index.values, rotation=30)
    axes.grid(True)
    plt.title("K-Line")

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)
    plt.tight_layout()
    plt.savefig(output_dir / "simple_kline.png", dpi=100)
    plt.close()
    print("Chart saved to output/simple_kline.png")


def plot_kline_with_volume():
    """
    带成交量的 K 线图

    用 mplfinance 画出更正式的金融图表：
    - 上半部分是 K 线
    - 下半部分是成交量柱状图
    - A 股配色：红涨绿跌
    """
    df = read_kline_data()
    df = df[["date", "close", "open", "high", "low", "volume"]]
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")

    # A 股配色：红涨绿跌
    my_color = mpf.make_marketcolors(
        up="red",
        down="green",
        wick="i",
        volume={"up": "red", "down": "green"},
        ohlc="i",
    )

    my_style = mpf.make_mpf_style(
        marketcolors=my_color,
        gridaxis="both",
        gridstyle="-.",
        rc={"font.family": "STSong"},
    )

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)

    mpf.plot(
        df,
        type="candle",
        title="K-Line with Volume",
        ylabel="price",
        style=my_style,
        show_nontrading=False,
        volume=True,
        ylabel_lower="volume",
        datetime_format="%Y-%m-%d",
        xrotation=45,
        linecolor="#00ff00",
        tight_layout=True,
        savefig=dict(fname=output_dir / "kline_with_volume.png", dpi=100),
    )
    plt.close()
    print("Chart saved to output/kline_with_volume.png")


def plot_kline_with_ma():
    """
    带成交量和均线的 K 线图

    在带成交量 K 线图的基础上，叠加 5 日和 10 日均线。
    均线能帮助观察价格的趋势方向。
    """
    df = read_kline_data()
    df = df[["date", "close", "open", "high", "low", "volume"]]
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")

    # A 股配色：红涨绿跌
    my_color = mpf.make_marketcolors(
        up="red",
        down="green",
        wick="i",
        volume={"up": "red", "down": "green"},
        ohlc="i",
    )

    my_style = mpf.make_mpf_style(
        marketcolors=my_color,
        gridaxis="both",
        gridstyle="-.",
        rc={"font.family": "STSong"},
    )

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)

    mpf.plot(
        df,
        type="candle",
        mav=[5, 10],
        title="K-Line with Volume & MA",
        ylabel="price",
        style=my_style,
        show_nontrading=False,
        volume=True,
        ylabel_lower="volume",
        datetime_format="%Y-%m-%d",
        xrotation=45,
        linecolor="#00ff00",
        tight_layout=True,
        savefig=dict(fname=output_dir / "kline_with_ma.png", dpi=100),
    )
    plt.close()
    print("Chart saved to output/kline_with_ma.png")


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  K 线图可视化 - 运行所有图表")
    print("=" * 50)

    plot_simple_kline()
    print()
    plot_kline_with_volume()
    print()
    plot_kline_with_ma()

    print("\n" + "=" * 50)
    print("  全部运行完毕！图表已保存到 output/ 目录")
    print("=" * 50)
