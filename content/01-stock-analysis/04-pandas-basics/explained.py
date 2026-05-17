"""
Pandas 股票数据基础 - 逐行讲解版

这个文件是 main.py 的"讲解版"。
每一行代码都附有中文注释，帮助零基础读者理解：
- 这行代码在做什么
- 为什么要这样写
- 哪些是固定写法，哪些可以改

建议先通读这个文件，再去看 main.py。
"""

import pandas as pd
# pandas 是 Python 里最常用的表格数据处理库之一
# 你可以把它理解成：专门处理"表格数据"的工具箱
# 比如 CSV、Excel、带行列结构的数据，通常都很适合用 pandas
#
# as pd 是固定且非常常见的简写
# 初学阶段建议先不要改

from pathlib import Path
# Path 是 Python 自带的路径工具
# 它能帮助我们更稳地找到文件
# 这样就不用把完整磁盘路径硬写死


DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
# DATA_FILE 用来保存 demo.csv 的路径
#
# 这句代码的意思是：
# 1. __file__ 表示当前这个 Python 文件自己的路径
# 2. .resolve() 拿到绝对路径
# 3. .parent 回到当前文件夹的上一级
# 4. 再 .parent 回到 content 目录
# 5. 再 .parent 回到项目根目录
# 6. 进入 data 文件夹
# 7. 找到 demo.csv
#
# 这样不管你在哪台电脑运行，都能找到数据文件


# ============================================================
# 第一步：读取 CSV 文件，查看表格基本信息
# ============================================================

def read_file():
    """读取 CSV 文件，查看表格基本信息和统计概况"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    # pd.read_csv(...) 是 pandas 里专门读取 CSV 的函数
    #
    # header=None 非常重要
    # 因为你这个 demo.csv 没有表头
    # 第一行本身就是数据
    #
    # 如果不写 header=None，
    # pandas 会默认把第一行当成列名
    # 这样真实的第一天数据就丢了
    #
    # encoding="utf-8-sig" 是为了更稳地处理 Windows 环境下的编码问题

    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    # df.columns 用来给这张表设置列名
    #
    # 因为这个 CSV 本身没有表头
    # 所以读进来以后，pandas 不知道每一列叫什么
    # 这里我们手动告诉它每一列叫什么
    #
    # 这是后面所有按列操作的基础
    # 比如后面你写 df["close"]，就依赖这里先把列名定义好

    print(df.info())
    # df.info() 会显示这张表的整体信息
    # 比如：有多少行、多少列、每列的数据类型、哪些列有没有空值
    #
    # 注意：df.info() 自己就会打印信息
    # 它返回值通常是 None
    # 所以 print(df.info()) 常常会多打印一个 None
    # 这不是错，只是显示效果上会多一行

    print("----------------------------------------------")

    print(df.describe())
    # df.describe() 会给数值列做基础统计汇总
    # 常见会看到：
    # - count：数量
    # - mean：平均值
    # - std：标准差
    # - min：最小值
    # - 25%、50%、75%：分位数
    # - max：最大值

    return df


# ============================================================
# 第二步：日期列处理
# ============================================================

def process_time():
    """把日期列从字符串转成 datetime，并提取年份和月份"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df["date"] = pd.to_datetime(df["date"])
    # pd.to_datetime(...) 是 pandas 里把日期文本转成"时间类型"的函数
    #
    # 为什么要这样做？
    # 因为原始 CSV 里的 date 一开始只是字符串
    # 比如 "2009/1/5"
    # 如果你不先转成 datetime，
    # 后面就没法稳定地取年份、月份、星期等信息
    #
    # 注意：2009/2/6、2009-2-6、2009.2.6、2009/02/06 这些格式都能识别

    df["year"] = df["date"].dt.year
    # .dt 是 pandas 里专门给"时间列"准备的时间访问器
    # .dt.year 表示把日期里的"年份"提取出来
    # 结果会新增一列 year

    df["month"] = df["date"].dt.month
    # .dt.month 表示把月份提取出来
    # 这一步是后面按月份分组统计的基础

    print(df)
    # 打印完整 DataFrame
    # 让你直观看到：原来的表现在多了 year 和 month 两列

    return df


# ============================================================
# 第三步：找最小收盘价
# ============================================================

def find_close_min():
    """找出最小收盘价、所在行号、以及对应整行数据"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    print("close min : {}".format(df["close"].min()))
    # df["close"] 表示取收盘价这一列
    # .min() 表示在这一列里找最小值

    print("close min index : {}".format(df["close"].idxmin()))
    # .idxmin() 不是返回最小值本身
    # 而是返回"最小值所在的行索引"
    #
    # 这点很重要：
    # min() 看值
    # idxmin() 看位置

    print("close min frame :\n{}".format(df.loc[df["close"].idxmin()]))
    # df.loc[...] 表示按"行标签"取数据
    # 这里先用 idxmin() 找到最小收盘价所在行号
    # 再用 loc 把这一整行取出来
    #
    # 这样你不只知道"最低收盘价是多少"
    # 还知道"它是哪一天发生的"

    return df


# ============================================================
# 第四步：按月分组统计
# ============================================================

def monthly_mean():
    """按月份分组，计算每月平均收盘价和平均开盘价"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df["date"] = pd.to_datetime(df["date"])
    # 先转时间类型，因为后面要从 date 里提月份

    df["month"] = df["date"].dt.month
    # 从日期列提取月份
    # 这样每一行现在都知道自己属于几月

    print(df.groupby("month")["close"].mean())
    # 这一行拆开看：
    #
    # df.groupby("month")
    # 表示：按 month 这一列分组
    #
    # ["close"]
    # 表示：只看 close 这一列
    #
    # .mean()
    # 表示：对每个月这一组数据求平均值
    #
    # 结果就是"每个月的平均收盘价"

    print(df.groupby("month")["open"].mean())
    # 和上一行完全同理
    # 只是把 close 换成 open
    # 所以结果变成"每个月的平均开盘价"

    return df


# ============================================================
# 第五步：涨跌额与涨跌比例
# ============================================================

def calc_rise_ratio():
    """计算涨跌额和涨跌比例"""

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]

    df["date"] = pd.to_datetime(df["date"])
    # 日期列转时间类型
    # 虽然这段代码当前没有继续用 dt.year、dt.month
    # 但保留 date 的规范时间格式是个好习惯

    df["rise"] = df["close"].diff()
    # diff() 是 pandas 里做"相邻差值"的函数
    #
    # df["close"].diff()
    # 的意思是：今天的收盘价 - 上一行的收盘价
    #
    # 如果你的数据是按日期从早到晚排的，
    # 那它就可以理解成：今日收盘价 - 昨日收盘价
    #
    # 第一行因为前面没有数据，所以通常会是 NaN

    df["rise_ratio"] = df["rise"] / df["close"].shift(1)
    # shift(1) 表示整张表整体"往下移动一行"
    # 所以当前行去取 ["close"] 时，拿到的是"上一行"的 close
    #
    # 也就是说，rise_ratio = 今日涨跌额 / 昨日收盘价
    # 这就是最常见的"日涨跌幅"计算方式
    #
    # 易错点：shift(1) 和 shift(-1) 很容易写反
    # - shift(1) 通常表示上一行
    # - shift(-1) 通常表示下一行
    # 但前提是你的数据是按日期从早到晚排序

    print(df)
    # 打印完整表
    # 让你看到新增的 rise 和 rise_ratio 两列长什么样

    return df


# ============================================================
# 主程序入口
# ============================================================

if __name__ == "__main__":
    # 只有直接运行这个文件时，下面的代码才会执行
    # 你可以取消注释某一行，只运行那一个函数

    read_file()
    process_time()
    find_close_min()
    monthly_mean()
    calc_rise_ratio()
