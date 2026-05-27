"""
NumPy 股票数据基础 - 逐行讲解版

这个文件是 main.py 的"讲解版"。
每一行代码都附有中文注释，帮助零基础读者理解：
- 这行代码在做什么
- 为什么要这样写
- 哪些是固定写法，哪些可以改

建议先通读这个文件，再去看 main.py。
"""

import numpy as np
# numpy 是 Python 最常用的数值计算库
# 把它简写成 np，是整个 Python 数据分析社区的惯例
# 你以后在任何教程里看到 np.xxx，基本都是 numpy

import matplotlib.pyplot as plt
# matplotlib 是 Python 的画图库
# pyplot 是它的"画图控制台"模块
# 简写成 plt，同样是社区惯例

from pathlib import Path
# Path 是 Python 内置的路径处理工具
# 比直接写字符串路径更稳定、更跨平台


# ============================================================
# 第一步：确定数据文件在哪里
# ============================================================

DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
# 逐层拆解：
#   Path(__file__)          -> 当前这个 .py 文件自己的路径
#   .resolve()              -> 转成完整的绝对路径
#   .parent                 -> 上一级目录（当前文件夹）
#   .parent.parent          -> 再上两级，到达 content/ 目录
#   / "data" / "demo.csv"   -> 进入 data 文件夹，找到 demo.csv
#
# 为什么要这样写？
# 因为这样不管你在哪台电脑、哪个目录运行，都能找到数据文件
# 比写死 "C:\xxx\demo.csv" 稳定得多


# ============================================================
# 第二步：读取股票数据
# ============================================================

def demo_read_file():
    """读取 CSV 文件中的收盘价和成交量"""

    file_name = DATA_FILE

    end_price, volume = np.loadtxt(
        fname=file_name,
        # fname 是 np.loadtxt() 规定的参数名，表示"读哪个文件"
        # 不能改成别的名字，这是 numpy 定义好的

        delimiter=",",
        # delimiter 表示"分隔符"
        # CSV = Comma-Separated Values，逗号分隔
        # 所以这里写英文逗号

        usecols=(2, 6),
        # usecols 表示"读取哪几列"
        # Python 列索引从 0 开始：
        #   0 = 第1列（股票代码）
        #   1 = 第2列（日期）
        #   2 = 第3列（收盘价）
        #   6 = 第7列（成交量）
        #
        # 可以改：换成别的列号就能读别的字段

        unpack=True,
        # unpack=True 表示"把读出来的列拆开"
        # 因为读了两列，所以左边用两个变量接收：
        #   end_price = 收盘价数组
        #   volume = 成交量数组

        encoding="utf-8-sig",
        # 编码方式
        # utf-8-sig 可以处理 Windows 下带 BOM 头的 CSV 文件
        # 如果读取时报编码错误，可以试试改成 "utf-8" 或 "gbk"
    )

    print(end_price)
    print(volume)


# ============================================================
# 第三步：基础统计 - 最大值、最小值
# ============================================================

def demo_max_min():
    """计算最高价的最大值、最低价的最小值"""

    high_price, low_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(4, 5),
        # 第5列 = 最高价，第6列 = 最低价
        unpack=True,
        encoding="utf-8-sig",
    )

    print("max_price = {}".format(high_price.max()))
    # high_price.max() 是 NumPy 数组自带的方法
    # 它会返回数组中最大的那个值
    # "{}".format(...) 是字符串格式化，把结果填进 {} 的位置

    print("low_price = {}".format(low_price.min()))
    # .min() 返回最小值


# ============================================================
# 第四步：极差（Peak to Peak）
# ============================================================

def demo_ptp():
    """计算极差 = 最大值 - 最小值"""

    high_price, low_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(4, 5),
        unpack=True,
        encoding="utf-8-sig",
    )

    print("ptp of high_price = {}".format(np.ptp(high_price)))
    # np.ptp() = peak to peak = 最大值 - 最小值
    # 它反映的是"这组数据拉开了多大距离"


# ============================================================
# 第五步：平均值与成交量加权平均价（VWAP）
# ============================================================

def demo_avg():
    """计算普通平均价和 VWAP"""

    end_price, volume = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2, 6),
        unpack=True,
        encoding="utf-8-sig",
    )

    print("avg_price = {}".format(np.average(end_price)))
    # np.average() 求平均值
    # 不加 weights 参数时，等价于所有数加起来除以个数

    print("VWAP = {}".format(np.average(end_price, weights=volume)))
    # 加了 weights=volume 之后，变成"成交量加权平均价"
    # 成交量大的那天，价格对平均值的影响更大
    # VWAP = Volume Weighted Average Price，量化里很常用的指标


# ============================================================
# 第六步：中位数
# ============================================================

def demo_median():
    """计算收盘价中位数"""

    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        # 注意：(2) 在 Python 里等于整数 2，不是元组
        # 但 np.loadtxt 允许传单个整数，所以能正常运行
        unpack=True,
        encoding="utf-8-sig",
    )

    print("median = {}".format(np.median(end_price)))
    # 中位数：先把所有数排序，再取最中间那个
    # 当数据里有极端值时，中位数比平均值更稳定


# ============================================================
# 第七步：方差
# ============================================================

def demo_var():
    """计算收盘价方差"""

    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )

    print("var = {}".format(np.var(end_price)))
    # np.var() 是 numpy 模块级别的方差函数

    print("var2 = {}".format(end_price.var()))
    # end_price.var() 是数组对象自己的方法
    # 两种写法结果一样，这是 Python 里常见的"同一个功能两种调用方式"


# ============================================================
# 第八步：对数收益率与波动率
# ============================================================

def demo_volatility():
    """计算对数收益率、年化波动率、月度波动率"""

    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )

    log_return = np.diff(np.log(end_price))
    # 从里到外拆解：
    #   np.log(end_price)    -> 对每个收盘价取自然对数
    #   np.diff(...)         -> 计算相邻两个值的差
    # 合起来就是"对数收益率序列"
    #
    # 金融含义：描述价格每天变化了多少

    annual_volatility = log_return.std() / log_return.mean() * np.sqrt(250)
    # log_return.std()    -> 收益率的标准差（波动程度）
    # log_return.mean()   -> 收益率的平均值
    # np.sqrt(250)        -> 一年约 250 个交易日的平方根
    #
    # 这是学习阶段的一种"年化波动率"写法
    # 以后会学到更规范的公式

    monthly_volatility = log_return.std() / log_return.mean() * np.sqrt(12)
    # 和上面一样，只是把 250 换成 12（一年 12 个月）

    print("log_return = {}".format(log_return))
    print("annual_volatility = {}".format(annual_volatility))
    print("monthly_volatility = {}".format(monthly_volatility))


# ============================================================
# 第九步：5 日简单移动平均线（SMA）
# ============================================================

def demo_sma():
    """计算并绘制 5 日简单移动平均线"""

    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )

    N = 5
    # N 是均线窗口长度
    # N=5 表示"最近 5 天的平均"
    # 可以改成 10（MA10）、20（MA20）等

    weights = np.ones(N) / N
    # np.ones(N) 生成 [1, 1, 1, 1, 1]
    # 除以 N=5 得到 [0.2, 0.2, 0.2, 0.2, 0.2]
    # 这就是"简单"移动平均的含义：每一天权重相同

    sma = np.convolve(weights, end_price)[N - 1 : -N + 1]
    # np.convolve() 卷积运算
    # 让 weights 窗口在 end_price 上滑动
    # 每滑动一次，做一次加权求和
    # [N-1:-N+1] 去掉前后不完整的边缘结果

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
    # plt.savefig() 保存图片到文件
    # 注意：服务器环境没有 GUI，不能用 plt.show()
    # plt.close() 关闭图形，释放内存


# ============================================================
# 第十步：理解 EMA 的前置知识
# ============================================================

def demo_exp():
    """演示 np.arange / np.exp / np.linspace"""

    x = np.arange(5)
    # np.arange(5) 生成 [0, 1, 2, 3, 4]
    # 注意：不包含 5 本身

    y = np.arange(10)
    # 生成 [0, 1, 2, ..., 9]

    print("exp(x) = {}".format(np.exp(x)))
    # np.exp(x) 对每个元素计算 e 的该元素次方
    # e = 2.71828...（自然常数）
    # 所以 exp(0)=1, exp(1)=2.718, exp(2)=7.389...

    print("linspace = {}".format(np.linspace(-1, 0, 5)))
    # np.linspace(-1, 0, 5) 在 -1 到 0 之间生成 5 个等间距数
    # 结果：[-1., -0.75, -0.5, -0.25, 0.]
    # 注意：和 arange 不同，linspace 包含终点


# ============================================================
# 第十一步：5 日指数移动平均线（EMA）
# ============================================================

def demo_ema():
    """计算并绘制 5 日指数移动平均线"""

    end_price = np.loadtxt(
        fname=DATA_FILE,
        delimiter=",",
        usecols=(2),
        unpack=True,
        encoding="utf-8-sig",
    )

    N = 5

    weights = np.exp(np.linspace(-1, 0, N))
    # 第一步：linspace 生成 [-1, -0.75, -0.5, -0.25, 0]
    # 第二步：exp 对每个值取指数
    # 结果是一组"后面更大"的权重
    # 这就是 EMA 的核心思想：越新的数据，权重越大

    weights /= weights.sum()
    # 归一化：让所有权重加起来等于 1
    # /= 是简写，等价于 weights = weights / weights.sum()

    ema = np.convolve(weights, end_price)[N - 1 : -N + 1]
    # 和 SMA 一样的卷积思路，只是权重不同

    t = np.arange(N - 1, len(end_price))
    # 横坐标从第 N 个数据开始
    # 因为前 N-1 个数据凑不够完整窗口

    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)

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


# ============================================================
# 主程序入口
# ============================================================

if __name__ == "__main__":
    # 只有直接运行这个文件时，下面的代码才会执行
    # 你可以取消注释某一行，只运行那一个函数

    demo_read_file()
    demo_max_min()
    demo_ptp()
    demo_avg()
    demo_median()
    demo_var()
    demo_volatility()
    demo_sma()
    demo_exp()
    demo_ema()
