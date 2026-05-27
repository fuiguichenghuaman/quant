"""
NumPy 股票数据基础 - 主脚本

功能：
  1. 从 CSV 读取股票数据（收盘价、成交量、最高价、最低价）
  2. 基础统计：最大值、最小值、极差、平均值、中位数、方差
  3. 成交量加权平均价（VWAP）
  4. 对数收益率与波动率
  5. 5 日简单移动平均线（SMA）
  6. 5 日指数移动平均线（EMA）

运行方式：
  cd content/01-stock-analysis/01-numpy-basics
  python main.py

依赖：
  pip install numpy matplotlib
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# -------------------------------------------------------
# 数据文件路径：相对于当前脚本，定位到 data/demo.csv
# -------------------------------------------------------
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"


def read_stock_data():
    """从 CSV 读取收盘价和成交量"""
    end_price, volume = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2, 6),
        unpack=True,
        encoding="utf-8-sig",
    )
    print("=== 收盘价 ===")
    print(end_price)
    print("\n=== 成交量 ===")
    print(volume)
    return end_price, volume


def calc_max_min():
    """计算最高价的最大值、最低价的最小值"""
    high_price, low_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(4, 5),
        unpack=True,
        encoding="utf-8-sig",
    )
    print("=== 最高价最大值 / 最低价最小值 ===")
    print("max_price = {}".format(high_price.max()))
    print("low_price = {}".format(low_price.min()))
    return high_price, low_price


def calc_ptp():
    """计算极差（peak to peak）"""
    high_price, low_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(4, 5),
        unpack=True,
        encoding="utf-8-sig",
    )
    print("=== 极差 ===")
    print("max - min of high_price = {}".format(np.ptp(high_price)))
    print("max - min of low_price  = {}".format(np.ptp(low_price)))


def calc_avg():
    """计算平均价格和成交量加权平均价（VWAP）"""
    end_price, volume = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2, 6),
        unpack=True,
        encoding="utf-8-sig",
    )
    print("=== 平均价 & VWAP ===")
    print("avg_price = {}".format(np.average(end_price)))
    print("VWAP      = {}".format(np.average(end_price, weights=volume)))


def calc_median():
    """计算收盘价中位数"""
    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )
    print("=== 中位数 ===")
    print("median = {}".format(np.median(end_price)))


def calc_var():
    """计算收盘价方差"""
    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )
    print("=== 方差 ===")
    print("var (np.var)  = {}".format(np.var(end_price)))
    print("var (方法)    = {}".format(end_price.var()))


def calc_volatility():
    """计算对数收益率、年化波动率、月度波动率"""
    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )
    log_return = np.diff(np.log(end_price))
    annual_volatility = log_return.std() / log_return.mean() * np.sqrt(250)
    monthly_volatility = log_return.std() / log_return.mean() * np.sqrt(12)

    print("=== 波动率 ===")
    print("log_return         = {}".format(log_return))
    print("annual_volatility  = {}".format(annual_volatility))
    print("monthly_volatility = {}".format(monthly_volatility))
    return log_return, annual_volatility, monthly_volatility


def calc_sma(N=5):
    """
    计算 N 日简单移动平均线（SMA）

    参数:
        N: 均线窗口长度，默认 5
    """
    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )

    # 权重：每一天同等重要
    weights = np.ones(N) / N

    # 卷积计算移动平均，去掉前后不完整窗口
    sma = np.convolve(weights, end_price)[N - 1 : -N + 1]

    print("=== {} 日简单移动平均线 ===".format(N))
    print(sma)

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)

    plt.figure(figsize=(10, 4))
    plt.plot(sma, linewidth=2, label="SMA{}".format(N))
    plt.title("SMA{} Simple Moving Average".format(N))
    plt.xlabel("Trading Day")
    plt.ylabel("Price")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_dir / "sma.png", dpi=100)
    plt.close()
    print("Chart saved to output/sma.png")

    return sma


def calc_exp_demo():
    """演示 np.arange / np.exp / np.linspace，帮助理解 EMA 权重生成"""
    x = np.arange(5)
    y = np.arange(10)

    print("=== EXP Demo ===")
    print("x:", x)
    print("y:", y)
    print("exp(x):", np.exp(x))
    print("exp(y):", np.exp(y))
    print("linspace(-1, 0, 5):", np.linspace(-1, 0, 5))


def calc_ema(N=5):
    """
    计算 N 日指数移动平均线（EMA）

    参数:
        N: 均线窗口长度，默认 5
    """
    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )

    # 指数权重：越近的数据权重越大
    weights = np.exp(np.linspace(-1, 0, N))
    weights /= weights.sum()

    # 卷积计算 EMA
    ema = np.convolve(weights, end_price)[N - 1 : -N + 1]

    print("=== {} 日指数移动平均线 ===".format(N))
    print("weights:", weights)
    print("ema:", ema)

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)

    t = np.arange(N - 1, len(end_price))
    plt.figure(figsize=(10, 4))
    plt.plot(t, end_price[N - 1 :], lw=1.0, label="Close Price")
    plt.plot(t, ema, lw=2.0, label="EMA{}".format(N))
    plt.title("EMA{} Exponential Moving Average".format(N))
    plt.xlabel("Trading Day")
    plt.ylabel("Price")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_dir / "ema.png", dpi=100)
    plt.close()
    print("Chart saved to output/ema.png")

    return ema


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  NumPy 股票数据基础 - 运行所有分析")
    print("=" * 50)

    read_stock_data()
    print()
    calc_max_min()
    print()
    calc_ptp()
    print()
    calc_avg()
    print()
    calc_median()
    print()
    calc_var()
    print()
    calc_volatility()
    print()
    calc_sma()
    print()
    calc_exp_demo()
    print()
    calc_ema()

    print("\n" + "=" * 50)
    print("  全部运行完毕！图表已保存到 output/ 目录")
    print("=" * 50)
