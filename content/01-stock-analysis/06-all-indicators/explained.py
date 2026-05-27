"""
综合技术指标图 - 逐行讲解版

这个文件是 main.py 的"讲解版"。
每一行代码都附有中文注释，帮助零基础读者理解：
- 这行代码在做什么
- 为什么要这样写
- 哪些是固定写法，哪些可以改

建议先通读这个文件，再去看 main.py。
"""

import pandas as pd
# pandas 是 Python 里最常用的数据分析库之一
# 在这份脚本里，它负责：
# 1. 读取 CSV
# 2. 处理日期
# 3. 计算均线
# 4. 计算 MACD
# 5. 计算 KDJ

import matplotlib
matplotlib.use("Agg")
# 设置非交互式后端，服务器环境必须加这行

import matplotlib.pyplot as plt
# matplotlib 是最基础的画图库
# 在这份脚本里，它负责：
# 1. 创建图形窗口
# 2. 创建 4 个子图区域
# 3. 画均线、成交量、MACD、KDJ
# 4. 设置标题、图例、网格、横坐标文字

from pathlib import Path
# Path 是 Python 自带的路径工具
# 用它来找数据文件和输出图片路径，会比直接手写磁盘路径更稳

from mplfinance.original_flavor import candlestick2_ochl
# 这是基础 K 线绘图函数
# 你前面在 K 线章节已经学过它
# 这里继续用它，是为了把"之前学会的 K 线画法"也整合进来


DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
# DATA_FILE 用来保存输入数据文件路径

OUTPUT_FILE = Path(__file__).resolve().parent / "output" / "all_indicators_chart.png"
# OUTPUT_FILE 用来保存输出图片路径
# 运行完脚本后，不只是弹出图
# 还会把图保存成一张图片，方便你以后复习、发笔记、做展示


# ============================================================
# 工具函数：读取数据
# ============================================================

def load_price_data():
    """读取并整理基础价格数据"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    # 读取 CSV
    # header=None：表示这份 CSV 没有表头
    # encoding="utf-8-sig"：使用这个编码方式读取，更稳

    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    # 手动给每一列命名

    df = df[["date", "close", "open", "high", "low", "volume"]].copy()
    # 只保留当前真正要用的列
    # .copy() 的作用是：明确创建一个独立副本，减少后面链式操作时的警告风险

    df["date"] = pd.to_datetime(df["date"])
    # 把日期列从文本转换成真正的日期类型

    df["x"] = range(len(df))
    # 新建一列 x，给每一行分配一个整数横坐标位置
    # 比如 0, 1, 2, 3, ...
    # 为什么要这么做？
    # 因为 candlestick2_ochl() 这种基础 K 线函数更习惯用"数字位置"画图

    df["date_label"] = df["date"].dt.strftime("%Y-%m-%d")
    # 把日期转换成适合横坐标显示的文字
    # strftime("%Y-%m-%d") 表示把日期格式化成：2026-05-04 这种样子

    return df


# ============================================================
# 工具函数：计算均线
# ============================================================

def cal_ma(df, ma_periods=(5, 10)):
    """计算均线"""
    for period in ma_periods:
        df[f"ma{period}"] = df["close"].rolling(period).mean()
        # df["close"]：取出收盘价这一列
        # .rolling(period)：做一个长度为 period 的滚动窗口
        # .mean()：在这个窗口里取平均值
        # 例如：当 period=5 时，就是 5 日均线
    return df


# ============================================================
# 工具函数：计算 MACD
# ============================================================

def cal_macd(df, fastperiod=12, slowperiod=26, signalperiod=9):
    """计算 MACD"""
    ewma12 = df["close"].ewm(span=fastperiod, adjust=False).mean()
    # 计算 12 日 EMA

    ewma26 = df["close"].ewm(span=slowperiod, adjust=False).mean()
    # 计算 26 日 EMA

    df["dif"] = ewma12 - ewma26
    # 计算 DIF

    df["dea"] = df["dif"].ewm(span=signalperiod, adjust=False).mean()
    # 计算 DEA

    df["bar"] = (df["dif"] - df["dea"]) * 2
    # 计算 MACD 柱状图值

    return df


# ============================================================
# 工具函数：计算 KDJ
# ============================================================

def cal_kdj(df):
    """计算 KDJ"""
    low_list = df["low"].rolling(9, min_periods=9).min()
    # 最近 9 天最低价

    low_list.fillna(value=df["low"].expanding().min(), inplace=True)
    # 当前面不足 9 天时，用从开头到当前的最低值补齐

    high_list = df["high"].rolling(9, min_periods=9).max()
    # 最近 9 天最高价

    high_list.fillna(value=df["high"].expanding().max(), inplace=True)
    # 当前面不足 9 天时，用从开头到当前的最高值补齐

    rsv = (df["close"] - low_list) / (high_list - low_list) * 100
    # 计算 RSV
    # 也就是"当前收盘价在最近 9 天区间里的相对位置"

    df["k"] = pd.DataFrame(rsv).ewm(com=2).mean()
    # 计算 K

    df["d"] = df["k"].ewm(com=2).mean()
    # 计算 D

    df["j"] = 3 * df["k"] - 2 * df["d"]
    # 计算 J

    return df


# ============================================================
# 工具函数：准备颜色
# ============================================================

def build_up_down_colors(df):
    """根据涨跌准备红绿颜色列表"""
    return ["red" if close >= open_price else "green" for close, open_price in zip(df["close"], df["open"])]
    # 如果当天收盘价 >= 开盘价，用红色
    # 否则用绿色


# ============================================================
# 完整流程函数：绘制综合图
# ============================================================

def plot_all_indicators():
    """绘制综合技术指标图并保存"""

    # 设置中文显示
    plt.rcParams["axes.unicode_minus"] = False
    # 让负号正常显示

    plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "STSong"]
    # 设置一组中文字体候选
    # 这样中文标题更容易正常显示

    # 第一步：读取并整理基础价格数据
    df = load_price_data()

    # 第二步：计算 5 日和 10 日均线
    df = cal_ma(df, ma_periods=(5, 10))

    # 第三步：计算 MACD
    df = cal_macd(df)

    # 第四步：计算 KDJ
    df = cal_kdj(df)

    print(df[["date", "close", "ma5", "ma10", "dif", "dea", "bar", "k", "d", "j"]])
    # 打印综合结果表

    # 给成交量柱子准备颜色
    volume_colors = build_up_down_colors(df)

    # 给 MACD 柱子准备颜色：bar > 0 用红色，否则用绿色
    macd_colors = ["red" if bar > 0 else "green" for bar in df["bar"]]

    # 创建 4 个上下排列的子图区域
    fig, (ax_price, ax_volume, ax_macd, ax_kdj) = plt.subplots(
        4,
        1,
        figsize=(16, 12),
        sharex=True,
        gridspec_kw={"height_ratios": [4, 1.6, 2.2, 2.2], "hspace": 0.08},
    )
    # 4, 1：表示 4 行 1 列
    # figsize=(16, 12)：整张图大小
    # sharex=True：4 个子图共用同一套横坐标，日期就能上下对齐
    # height_ratios：控制 4 个区域的高度比例，价格图最大

    fig.patch.set_facecolor("#f7f9fc")
    # 设置整张图的背景色

    # 统一美化 4 个子图
    for ax in (ax_price, ax_volume, ax_macd, ax_kdj):
        ax.set_facecolor("white")
        ax.grid(linestyle="-.", alpha=0.35)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    # 子图背景设成白色
    # 网格线做得轻一点
    # 去掉上边框和右边框
    # 这样看起来会更清爽

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
    # 用 candlestick2_ochl() 画蜡烛图
    # 依次传入：开盘价、收盘价、最高价、最低价
    # width=0.65：K 线柱体宽度
    # alpha=0.9：透明度，越接近 1 越实

    ax_price.plot(df["x"], df["ma5"], color="#f59e0b", linewidth=1.4, label="MA5")
    # 画 5 日均线

    ax_price.plot(df["x"], df["ma10"], color="#2563eb", linewidth=1.4, label="MA10")
    # 画 10 日均线

    ax_price.set_ylabel("价格")
    ax_price.set_title("000001 平安银行 技术指标综合图", fontsize=15, pad=12)
    ax_price.legend(loc="upper left")

    # === 第二块：成交量 ===
    ax_volume.bar(df["x"], df["volume"], color=volume_colors, width=0.6, alpha=0.8)
    # 画成交量柱子，颜色由 volume_colors 决定

    ax_volume.set_ylabel("成交量")

    # === 第三块：MACD ===
    ax_macd.plot(df["x"], df["dif"], color="#2563eb", linewidth=1.2, label="DIF")
    # 画 DIF 线

    ax_macd.plot(df["x"], df["dea"], color="#ef4444", linewidth=1.2, label="DEA")
    # 画 DEA 线

    ax_macd.bar(df["x"], df["bar"], color=macd_colors, width=0.6, alpha=0.55, label="BAR")
    # 画 MACD 柱子，正值红色，负值绿色

    ax_macd.axhline(0, color="#64748b", linewidth=0.9)
    # 在 0 的位置画一条参考线

    ax_macd.set_ylabel("MACD")
    ax_macd.legend(loc="upper left", ncol=3)

    # === 第四块：KDJ ===
    ax_kdj.plot(df["x"], df["k"], color="#ef4444", linewidth=1.2, label="K")
    # 画 K 线

    ax_kdj.plot(df["x"], df["d"], color="#eab308", linewidth=1.2, label="D")
    # 画 D 线

    ax_kdj.plot(df["x"], df["j"], color="#2563eb", linewidth=1.2, label="J")
    # 画 J 线

    ax_kdj.axhline(80, color="#94a3b8", linewidth=0.9, linestyle="--")
    ax_kdj.axhline(20, color="#94a3b8", linewidth=0.9, linestyle="--")
    # 在 KDJ 区域里额外画 80 和 20 两条虚线
    # 这样看起来更像正式指标图，也更容易观察高低区间

    ax_kdj.set_ylabel("KDJ")
    ax_kdj.legend(loc="upper left", ncol=3)

    # 设置横坐标日期
    tick_step = 1 if len(df) <= 20 else max(1, len(df) // 10)
    # 如果数据不多（比如 20 行以内），就每个都显示
    # 如果数据很多，就隔一段再显示，避免太挤

    tick_positions = df["x"][::tick_step]
    tick_labels = df["date_label"][::tick_step]
    # 准备横坐标位置和日期文字

    ax_kdj.set_xticks(tick_positions)
    ax_kdj.set_xticklabels(tick_labels, rotation=30, ha="right")
    # 在最下方 KDJ 区域设置横坐标日期
    # 旋转 30 度，并右对齐

    # 保存图片
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    # 如果 output 目录还不存在，就先自动创建

    fig.savefig(OUTPUT_FILE, dpi=220, bbox_inches="tight")
    # 把整张图保存成图片
    # dpi=220：图片清晰度
    # bbox_inches="tight"：尽量把多余空白裁紧

    plt.close()
    # 关闭图形，释放内存

    print(f"图像已保存到: {OUTPUT_FILE}")

    return df


# ============================================================
# 主程序入口
# ============================================================

if __name__ == "__main__":
    # 只有直接运行这个文件时，下面的代码才会执行

    plot_all_indicators()
