"""
K 线图可视化 - 讲解版脚本

这个文件是 main.py 的"讲解版"。
它不是为了把代码改得更复杂，而是为了帮助你像上课一样，
真正理解这份代码是怎么写出来的、为什么这样写。

你当前这份代码主要完成了三个任务：
1. 读取本地 CSV 数据，画出基础 K 线图
2. 读取同样的数据，画出"带成交量"的 K 线图
3. 在带成交量 K 线图的基础上，再叠加均线

输入数据是什么：
- 输入数据是 data/demo.csv
- 这份 CSV 没有表头
- 每一行代表一个交易日
- 每一列大致表示：
  1. 股票代码
  2. 日期
  3. 收盘价
  4. 开盘价
  5. 最高价
  6. 最低价
  7. 成交量

输出结果是什么：
- 输出结果是 output/ 目录下的三张图片：
  1. simple_kline.png — 基础 K 线图
  2. kline_with_volume.png — 带成交量的 K 线图
  3. kline_with_ma.png — 带成交量并叠加均线的 K 线图

代码运行的大致流程是什么：
1. 先导入 pandas、matplotlib、mplfinance、Path
2. 找到本地数据文件
3. 用 pandas 读取 CSV
4. 给每一列命名
5. 用基础函数 candlestick2_ochl() 画普通 K 线图
6. 用 mpf.plot() 画带成交量的 K 线图
7. 再用 mpf.plot() 画带成交量并叠加均线的 K 线图
8. 每张图都保存为 PNG 文件

它在量化交易学习中属于哪一块内容：
- 属于"量化可视化入门"
- 你前面已经学过读取 CSV、统计量、均线的基本计算
- 现在这一章开始把"价格"和"均线"真正画出来
- 这一步很重要，因为量化学习不能只会算数，还要会从图上观察价格结构
"""

import pandas as pd
# pandas 是 Python 里最常用的数据分析库之一
# 你可以把它理解成"Python 里的电子表格工具箱"
# 它擅长做的事情包括：
# 1. 读取 CSV / Excel
# 2. 给每一列命名
# 3. 按列取数据
# 4. 处理日期
# 5. 做统计和分组分析
#
# 这一章里，pandas 的主要作用是：
# 把本地的股票 CSV 文件读成一张 DataFrame 表

import matplotlib.pyplot as plt
# matplotlib 是 Python 最基础、最常见的画图库
# pyplot 通常固定简写成 plt，这是非常常见的固定写法
#
# 这章里它主要负责：
# 1. 创建图形窗口
# 2. 创建坐标轴
# 3. 保存图像为文件

import mplfinance as mpf
# mplfinance 是专门画金融图表的库
# 比如：
# - K 线图
# - 成交量图
# - 均线叠加图
#
# 你可以把它理解成：
# "在 matplotlib 基础上，专门为股票图表做过包装的一套工具"

from pathlib import Path
# Path 是 Python 自带的路径工具
# 用它来找文件路径，比直接手写磁盘路径更稳

from mplfinance.original_flavor import candlestick2_ochl
# 这里导入的是一个基础 K 线图绘制函数
#
# 函数名里的 ochl 可以这样记：
# o = open   开盘价
# c = close  收盘价
# h = high   最高价
# l = low    最低价
#
# 它适合教学，因为它要求你亲手把 K 线最核心的价格列传进去
# 这样你会更清楚：K 线图到底是由哪些数据组成的


DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
# DATA_FILE 是一个变量，用来保存 CSV 文件路径
#
# 为什么这样写：
# 1. `__file__` 表示当前这个 Python 文件自己的位置
# 2. `.resolve()` 把路径变成更明确的绝对路径
# 3. `.parent.parent.parent` 表示往上退三层目录
#    当前文件在 content/01-stock-analysis/02-kline-visualization/ 里
#    往上三层后回到项目根目录
# 4. 再拼接 `"data" / "demo.csv"`
#    就得到了项目根目录下的 data/demo.csv


def read_kline_data():
    """从 CSV 读取 K 线数据"""
    # 这个函数负责：
    # 1. 读取 CSV 文件
    # 2. 给每一列命名
    # 3. 返回完整的 DataFrame

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    # pd.read_csv() 是 pandas 里最常用的 CSV 读取函数
    #
    # 这里几个参数要重点记：
    # 1. `DATA_FILE`
    #    表示读哪个文件
    # 2. `header=None`
    #    表示这份 CSV 没有表头
    #    第一行就是数据，不要把第一行当成列名
    # 3. `encoding="utf-8-sig"`
    #    指定编码方式，避免乱码或读取失败
    #
    # 易错点：
    # 如果漏掉 `header=None`
    # 第一行真实数据会被错误当成列名

    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    # 手动给 DataFrame 每一列命名
    #
    # 为什么要这样写：
    # 因为原始 CSV 没有表头
    # 如果不手动命名，后面就只能用 0、1、2、3 这些列号取值
    # 可读性会很差

    return df
    # 把准备好的 DataFrame 返回出去


def plot_simple_kline():
    """
    基础 K 线图

    用 candlestick2_ochl 画出最基本的 K 线图。
    重点是理解 K 线由 open/close/high/low 四列价格组成。
    """
    # 这个函数的目标：
    # 用比较"基础"的方式画出一张 K 线图
    #
    # 它的重点不在于图画得多复杂
    # 而在于让你先理解：
    # K 线图到底需要哪几列价格数据

    df = read_kline_data()
    # 调用前面写好的函数，读取数据

    fig = plt.figure()
    # plt.figure() 表示创建一张图
    # 你可以把它理解成：先准备一张空白画布

    axes = fig.add_subplot(111)
    # add_subplot(111) 是 matplotlib 很常见的固定写法
    # 111 可以先简单理解成：
    # 1 行、1 列、当前使用第 1 个子图

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
    # 这一段是基础 K 线图绘制的核心
    #
    # `candlestick2_ochl()` 需要你传入 K 线最核心的四列价格：
    # - opens  : 开盘价
    # - closes : 收盘价
    # - highs  : 最高价
    # - lows   : 最低价
    #
    # 为什么后面都加 `.values`：
    # 因为 `df["open"]` 得到的是 pandas 的 Series
    # `.values` 会把它变成更直接的数组形式
    # 这个函数更喜欢这种底层数组数据
    #
    # `width=0.75`
    # 表示每根 K 线柱体的宽度
    # 这个可以改，改大柱体更粗，改小柱体更细
    #
    # `colorup="red"`
    # 表示上涨 K 线用红色（A 股习惯）
    #
    # `colordown="green"`
    # 表示下跌 K 线用绿色（A 股习惯）

    plt.xticks(range(len(df.index.values)), df.index.values, rotation=30)
    # xticks 是设置横坐标刻度
    #
    # 这里的意思是：
    # 1. 横坐标位置：0, 1, 2, 3, ...
    # 2. 显示的标签：df.index.values
    # 3. 标签旋转 30 度，避免重叠

    axes.grid(True)
    # 给图加网格，方便观察

    plt.title("K-Line")
    # 设置图标题

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
    # 这个函数是在前面基础版上做升级
    # 它会画一张更像正式行情界面的图
    #
    # 和前面相比，主要升级点有：
    # 1. 横坐标使用真正的日期
    # 2. 用 mplfinance 专门画金融图表
    # 3. 下方增加成交量图

    df = read_kline_data()
    # 读取数据

    df = df[["date", "close", "open", "high", "low", "volume"]]
    # 重新整理列顺序
    #
    # 为什么这样做：
    # 因为画图真正关心的是：
    # 日期、收盘价、开盘价、最高价、最低价、成交量
    # stock_id 在当前这张图里暂时用不到

    df["date"] = pd.to_datetime(df["date"])
    # 把 date 列从文本转换成真正的日期类型
    # 这样后面时间轴才能按日期来处理

    df = df.set_index("date")
    # 把 date 设置成索引
    # 这会让 DataFrame 更像"按时间排列的金融数据表"
    # mplfinance 非常喜欢这种格式

    # A 股配色：红涨绿跌
    my_color = mpf.make_marketcolors(
        up="red",
        down="green",
        wick="i",
        volume={"up": "red", "down": "green"},
        ohlc="i",
    )
    # make_marketcolors() 是 mplfinance 的颜色配置函数
    #
    # `up="red"`
    # 上涨 K 线用红色
    #
    # `down="green"`
    # 下跌 K 线用绿色
    #
    # `wick="i"`
    # 这里的 i 可以先理解成 inherit，表示继承涨跌颜色
    #
    # `volume={"up": "red", "down": "green"}`
    # 表示成交量柱子也跟着涨跌颜色变化
    #
    # `ohlc="i"`
    # 表示 open/high/low/close 相关线条也继承涨跌颜色

    my_style = mpf.make_mpf_style(
        marketcolors=my_color,
        gridaxis="both",
        gridstyle="-.",
        rc={"font.family": "STSong"},
    )
    # make_mpf_style() 是 mplfinance 的整体样式配置函数
    #
    # `marketcolors=my_color`
    # 使用刚才定义好的颜色规则
    #
    # `gridaxis="both"`
    # 横轴和纵轴都显示网格
    #
    # `gridstyle="-."`
    # 网格线的样式
    #
    # `rc={"font.family": "STSong"}`
    # 设置字体族，主要是为了让中文更容易显示正常

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
    # mpf.plot() 是 mplfinance 最核心的绘图函数
    #
    # `type="candle"`
    # 表示图形类型是 K 线图
    #
    # `title="K-Line with Volume"`
    # 图标题
    #
    # `ylabel="price"`
    # 上半部分价格图的纵轴标签
    #
    # `style=my_style`
    # 使用前面定义好的整体样式
    #
    # `show_nontrading=False`
    # 不显示非交易日，这样横轴更紧凑
    #
    # `volume=True`
    # 表示下方增加成交量图
    #
    # `ylabel_lower="volume"`
    # 成交量图的纵轴标签
    #
    # `datetime_format="%Y-%m-%d"`
    # 控制日期显示格式
    #
    # `xrotation=45`
    # 横坐标日期旋转 45 度，避免挤在一起
    #
    # `savefig=dict(...)`
    # 用 savefig 参数保存图片，而不是 plt.show()

    plt.close()
    print("Chart saved to output/kline_with_volume.png")


def plot_kline_with_ma():
    """
    带成交量和均线的 K 线图

    在带成交量 K 线图的基础上，叠加 5 日和 10 日均线。
    均线能帮助观察价格的趋势方向。
    """
    # 这个函数是在"带成交量 K 线图"的基础上继续升级：
    # 再叠加均线
    #
    # 这一步在量化学习里非常重要
    # 因为前面你已经学过均线的计算
    # 现在你开始看到：均线画到图上以后是什么样子

    df = read_kline_data()
    # 读取数据

    df = df[["date", "close", "open", "high", "low", "volume"]]
    # 只保留画图需要的列，并整理顺序

    df["date"] = pd.to_datetime(df["date"])
    # 把日期列转成 datetime

    df = df.set_index("date")
    # 把日期列设成索引

    # A 股配色：红涨绿跌
    my_color = mpf.make_marketcolors(
        up="red",
        down="green",
        wick="i",
        volume={"up": "red", "down": "green"},
        ohlc="i",
    )
    # 颜色配置和前一个函数一样
    # 说明你已经开始学会复用前面已经写好的规则

    my_style = mpf.make_mpf_style(
        marketcolors=my_color,
        gridaxis="both",
        gridstyle="-.",
        rc={"font.family": "STSong"},
    )
    # 整体样式也和前一个函数保持一致
    # 这样这张图和前一张图就属于同一套视觉风格

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
    # 这一段和前一个函数最关键的区别就在：
    # 多了 `mav=[5, 10]`
    #
    # `mav` 一般可以理解成 moving averages
    # 也就是"移动平均线"
    #
    # `mav=[5, 10]` 的意思是：
    # 在这张 K 线图上，同时画出 5 日均线和 10 日均线
    #
    # 为什么是 5 和 10：
    # - 5 日均线更短，更贴近最近价格
    # - 10 日均线更平滑一些
    #
    # 你可以把均线理解成：
    # "把每天跳来跳去的价格稍微抹平之后形成的一条趋势线"
    #
    # `mav` 这里是可以改的：
    # - 改成 [5]
    #   只画一条 5 日均线
    # - 改成 [5, 10, 20]
    #   同时画 5 日、10 日、20 日均线
    # - 改成 [20, 60]
    #   更偏中长期观察
    #
    # 易错点：
    # `mav` 这里通常传的是"周期整数"
    # 不是你自己手动算出来的一整列均线值
    # mplfinance 会根据这个周期自动帮你画出来

    plt.close()
    print("Chart saved to output/kline_with_ma.png")


"""
固定写法与可修改部分

1. 初学阶段建议不要乱改的固定写法
- `import pandas as pd`
- `import matplotlib.pyplot as plt`
- `import mplfinance as mpf`
- `from mplfinance.original_flavor import candlestick2_ochl`
- `pd.read_csv(..., header=None, encoding="utf-8-sig")`
- `df["date"] = pd.to_datetime(df["date"])`
- `df = df.set_index("date")`
- `plt.savefig(...)`  服务器环境用这个，不要用 plt.show()

2. 可以根据需求修改的参数
- `DATA_FILE`
  可以改，改成别的 CSV 文件后，就会读取别的数据
- `df.columns = [...]`
  可以改，但必须和你的 CSV 列顺序真实对应
- `width=0.75`
  可以改，只影响基础 K 线柱体宽度
- `colorup="red"`、`colordown="green"`
  可以改，只影响涨跌颜色
- `title="K-Line"`
  可以改，只影响图标题
- `ylabel="price"`、`ylabel_lower="volume"`
  可以改，只影响坐标轴标签
- `datetime_format="%Y-%m-%d"`
  可以改，会影响日期显示方式
- `xrotation=45`
  可以改，会影响横坐标文字旋转角度
- `mav=[5, 10]`
  可以改，会影响均线的周期和条数
- `tight_layout=True`
  可以改，只影响图像排版是否紧凑


容易出错的地方

1. CSV 没有表头却忘了写 `header=None`
   这样第一行真实数据会被错误当成列名

2. 颜色字符串写错
   比如写成 `up='red,'`
   多一个逗号就会报错

3. 忘记先把日期转成 datetime
   时间轴就不够规范，图也更容易乱

4. 忘记把 date 设为索引
   `mplfinance` 更喜欢日期在索引位置上的表结构

5. 把"均线周期"和"均线数据本身"混为一谈
   `mav=[5, 10]` 这里传的是周期，不是手动算好的均线数组

6. 服务器环境用 plt.show() 而不是 plt.savefig()
   plt.show() 需要 GUI 环境，服务器上会报错


用生活化例子解释核心逻辑

假设某只股票某一天的数据是：
- 开盘价：10
- 收盘价：12
- 最高价：13
- 最低价：9
- 成交量：500000

那么这一天的 K 线可以这样理解：

1. 因为收盘价 12 高于开盘价 10
   所以这是一根"上涨 K 线"
   在 A 股常见配色里，它通常会画成红色

2. 最高价 13 表示这一天盘中最高摸到过 13
   所以上方会有一段影线

3. 最低价 9 表示这一天盘中最低到过 9
   所以下方会有一段影线

4. 开盘价和收盘价之间形成中间那段"实体部分"
   这就是 K 线最显眼的部分

5. 如果再加上成交量 500000
   你不仅知道"价格怎么动了"
   还知道"这一天交易活不活跃"

再往前一步看均线：
- 5 日均线就是最近连续 5 天收盘价的平均趋势线
- 10 日均线就是最近连续 10 天收盘价的平均趋势线

所以：
- K 线图告诉你每天的价格结构
- 成交量图告诉你交易热度
- 均线告诉你更平滑的价格趋势


学习总结

通过这份代码，你现在学会了这些东西：
1. 如何把 CSV 股票数据画成 K 线图
2. K 线图最核心依赖的是开盘价、收盘价、最高价、最低价
3. 如何在图下方加成交量
4. 为什么日期列要先转成 datetime，再设为索引
5. 如何用 `mav=[5, 10]` 在图上叠加均线
6. K 线、成交量、均线三者各自表达什么信息

这段代码在量化交易里的意义是：
- 它让你从"看数字"进一步走到"看图"
- 后面学均线策略、趋势判断、回测可视化时，都会用到这些基础

你下一步很适合继续学：
1. 用 pandas 自己计算均线，再和图上的均线对照
2. 叠加更多均线，比如 20 日和 60 日
3. 学习如何画收盘价曲线
4. 学习如何把收益率或指标也可视化出来
"""


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    # 这是 Python 里非常常见的主程序入口固定写法
    # 只有当你直接运行这个文件时，下面的代码才会执行

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
