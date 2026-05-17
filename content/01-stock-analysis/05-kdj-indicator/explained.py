"""
KDJ 指标计算与绘图 - 逐行讲解版

这个文件是 main.py 的"讲解版"。
每一行代码都附有中文注释，帮助零基础读者理解：
- 这行代码在做什么
- 为什么要这样写
- 哪些是固定写法，哪些可以改

建议先通读这个文件，再去看 main.py。
"""

import pandas as pd
# pandas 是 Python 里最常用的数据分析库之一
# 这份代码里它主要负责：
# 1. 读取 CSV
# 2. 给表格列命名
# 3. 处理滚动窗口
# 4. 计算滚动最高价、最低价
# 5. 计算 K、D、J 三列

import matplotlib
matplotlib.use("Agg")
# 设置非交互式后端，服务器环境必须加这行

import matplotlib.pyplot as plt
# matplotlib 是基础画图库
# 这份代码里它负责：
# 1. 创建图形窗口
# 2. 画 K、D、J 三条线
# 3. 设置图例、网格、标题、横坐标日期显示

from pathlib import Path
# Path 是 Python 自带的路径工具
# 用来找 demo.csv 的位置


DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
# DATA_FILE 保存 demo.csv 的路径
# 写法和前面几章保持一致


# ============================================================
# KDJ 计算函数（工具函数）
# ============================================================

def cal_kdj(df):
    """
    计算 KDJ 指标

    这是一个"工具函数"：
    - 它不会自己去读文件
    - 它只负责：你给我一张表 df，我帮你把 KDJ 算出来

    参数:
        df: 包含 close、high、low 列的 DataFrame

    返回:
        新增 k、d、j 三列的 DataFrame
    """

    low_list = df["low"].rolling(9, min_periods=9).min()
    # 这一行是在计算最近 9 天里的最低价
    #
    # df["low"]：先取出最低价这一列
    # .rolling(9, min_periods=9)：做一个长度为 9 的滚动窗口
    #   你可以把它理解成：每次都拿"最近连续 9 天"的数据出来看
    #   min_periods=9：表示至少要满 9 天，才按正常 9 天窗口计算
    # .min()：在这个窗口里取最低值

    low_list.fillna(value=df["low"].expanding().min(), inplace=True)
    # 前面前 8 天因为凑不满 9 天，会出现缺失值 NaN
    # 所以这里用 fillna() 去补
    #
    # df["low"].expanding().min()
    # expanding 表示"从开头一直扩展到当前"
    # 第 1 天就看前 1 天，第 2 天就看前 2 天，以此类推
    # 这样前面天数不够 9 天时，也能先给出一个过渡值

    high_list = df["high"].rolling(9, min_periods=9).max()
    # 和上面的 low_list 对应
    # 它是在计算最近 9 天里的最高价
    # .max() 表示在窗口里取最高值

    high_list.fillna(value=df["high"].expanding().max(), inplace=True)
    # 和前面的 low_list.fillna 一样
    # 目的是补上前面凑不满 9 天时的缺失值

    rsv = (df["close"] - low_list) / (high_list - low_list) * 100
    # 这一行是在计算 RSV
    #
    # RSV 可以先理解成：
    # "当前收盘价在最近这段价格区间里的相对位置"
    #
    # 公式意思是：
    # (当前收盘价 - 最近9天最低价) / (最近9天最高价 - 最近9天最低价) * 100
    #
    # 如果收盘价更靠近最近 9 天的高点，RSV 通常就更大；
    # 如果更靠近低点，RSV 通常就更小。

    df["k"] = pd.DataFrame(rsv).ewm(com=2).mean()
    # K 值是对 RSV 做平滑处理得到的
    #
    # pd.DataFrame(rsv)：先把 rsv 变成 DataFrame 形式
    # .ewm(com=2).mean()：指数加权平均
    #   com=2 是 ewm 的一种参数写法，控制平滑程度
    #   这里的作用可以简单理解成：不让 RSV 太抖，先把它平滑成 K 线

    df["d"] = df["k"].ewm(com=2).mean()
    # D 值是对 K 值再做一次平滑
    # 所以你可以这样记：
    # RSV -> 平滑一次 -> K
    # K   -> 再平滑一次 -> D

    df["j"] = 3 * df["k"] - 2 * df["d"]
    # J 值是通过 K 和 D 推出来的
    # 公式是：J = 3*K - 2*D
    # J 通常会比 K 和 D 更敏感一些，波动也可能更大

    return df
    # 最后把新增了 k / d / j 三列的表返回出去


# ============================================================
# KDJ 绘图函数（完整流程函数）
# ============================================================

def plot_kdj():
    """读取数据、计算 KDJ、绘制并保存图表"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    # 读取 CSV
    # header=None：表示这份 CSV 没有表头
    # encoding="utf-8-sig"：使用这个编码读取，更稳一些

    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    # 给每一列命名

    df = df[["date", "close", "open", "high", "low", "volume"]]
    # 重新整理列顺序，并去掉当前暂时用不到的 stock_id

    df["date"] = pd.to_datetime(df["date"])
    # 把日期列从文本转换成真正的日期类型

    df_kdj = cal_kdj(df)
    # 这里是最关键的流程连接点
    # 前面已经把 DataFrame 准备好了
    # 现在把它交给工具函数 cal_kdj(df)
    # 让它帮你算出 k / d / j

    print(df_kdj)
    # 把新增了 KDJ 三列的表打印出来

    # 设置中文字体
    plt.rcParams["axes.unicode_minus"] = False
    # 让负号更正常显示

    plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "STSong"]
    # 设置中文字体为黑体
    # 这样中文标题更容易正常显示

    plt.figure(figsize=(12, 6))
    # 创建一张新图，设置大小

    df_kdj["k"].plot(color="red", label="K")
    # 画 K 线，红色表示

    df_kdj["d"].plot(color="yellow", label="D")
    # 画 D 线，黄色表示

    df_kdj["j"].plot(color="blue", label="J")
    # 画 J 线，蓝色表示

    plt.legend(loc="best")
    # 显示图例
    # loc="best" 表示自动找一个较合适的位置

    major_index = df_kdj.index[df_kdj.index]
    major_xtics = df_kdj["date"][df_kdj.index]
    # 这两行是在准备横坐标位置和横坐标显示的日期文字
    # 目的：让横坐标显示日期

    plt.xticks(major_index, major_xtics)
    # 把横坐标位置和日期文字真正设置上去

    plt.setp(plt.gca().get_xticklabels(), rotation=30)
    # 把横坐标日期旋转 30 度，避免文字挤在一起

    plt.grid(linestyle="-.")
    # 给图加网格，方便观察

    plt.title("000001 平安银行 KDJ 图")
    # 设置图标题

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)
    plt.tight_layout()
    plt.savefig(output_dir / "kdj.png", dpi=150)
    plt.close()
    # plt.savefig() 保存图片到文件
    # 注意：服务器环境没有 GUI，不能用 plt.show()
    # plt.close() 关闭图形，释放内存

    print("Chart saved to output/kdj.png")

    return df_kdj


# ============================================================
# 主程序入口
# ============================================================

if __name__ == "__main__":
    # 只有直接运行这个文件时，下面的代码才会执行

    plot_kdj()
