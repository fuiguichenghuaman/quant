"""
MACD 指标 - 讲解版脚本

这个文件是 main.py 的"讲解版"。
它的目标不是把代码改成更花哨的高级写法，
而是像老师上课一样，带你理解：

1. 这份代码整体在做什么
2. MACD 到底是什么
3. 为什么要先读 CSV，再算指标
4. `calc_macd()` 和 `plot_macd()` 为什么不是同一种函数

你当前这份 MACD 代码，已经不只是"算出 MACD 数字"了，
而是已经进入了"计算 + 画图"的阶段。

它主要完成的任务是：
1. 读取股票 CSV 数据
2. 计算 MACD 的三列结果：`dif`、`dea`、`bar`
3. 画出两条线和柱状图

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
- output/macd.png — MACD 图
- 图里包括：
  - `dea` 线（红色）
  - `dif` 线（蓝色）
  - `bar` 柱子（红绿柱状图）

MACD 在量化学习中属于哪一块：
- 属于"技术指标入门"
- 它是在你学过价格、均线、K 线之后继续往前走的一步
- 很多量化策略、技术分析、可视化练习里都会遇到它

代码运行的大致流程是：
1. 导入 pandas、matplotlib、Path
2. 准备数据文件路径
3. 定义 `calc_macd()`：专门负责"计算 MACD"
4. 定义 `plot_macd()`：负责"读取数据、整理数据、调用 calc_macd()、画图"
5. 在 `if __name__ == "__main__":` 里决定真正运行哪个函数

这里最关键的理解点是：

1. `calc_macd()` 是"工具函数"
   它像一个专门做加工的小工具。
   你要先给它原材料 `df`，它才能帮你计算。

2. `plot_macd()` 是"完整流程函数"
   它会自己准备原材料，再调用工具函数完成整套工作。

所以：
- 工具函数：做一个专门的小任务，通常需要别人先把数据传进去
- 完整流程函数：自己先读数据、整理数据，再调用工具函数
"""

import pandas as pd
# pandas 是 Python 里最常用的数据分析库之一
# 你可以把它理解成"Python 里的电子表格工具箱"
# 这份代码里它主要负责：
# 1. 读取 CSV
# 2. 给列命名
# 3. 处理日期
# 4. 计算指数移动平均

import matplotlib.pyplot as plt
# matplotlib 是最基础的画图库
# 这份代码里它已经真正开始负责画图了
# 比如：
# - 创建图形窗口
# - 画 dif 线
# - 画 dea 线
# - 画柱状图
# - 设置标题、图例、网格和横坐标文字

from pathlib import Path
# Path 是 Python 自带的路径工具
# 用它比直接硬写磁盘路径更稳


DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "demo.csv"
# DATA_FILE 用来保存 demo.csv 的路径
#
# 这行为什么这样写：
# 1. `__file__` 表示当前脚本自己的位置
# 2. `.resolve()` 把路径变成更明确的绝对路径
# 3. `.parent.parent.parent` 往上退三层目录
#    当前文件在 content/01-stock-analysis/03-macd-indicator/ 里
#    往上三层后回到项目根目录
# 4. 再拼接 `"data" / "demo.csv"`
#    就得到了项目根目录下的 data/demo.csv


def read_stock_data():
    """从 CSV 读取股票数据"""
    # 这个函数负责：
    # 1. 读取 CSV 文件
    # 2. 给每一列命名
    # 3. 整理列顺序
    # 4. 转换日期格式
    # 5. 返回准备好的 DataFrame

    df = pd.read_csv(DATA_FILE, header=None, encoding="utf-8-sig")
    # 读取 CSV
    #
    # `header=None`
    # 表示这个 CSV 没有表头
    #
    # `encoding="utf-8-sig"`
    # 表示按这个编码读取，更稳一些

    df.columns = ["stock_id", "date", "close", "open", "high", "low", "volume"]
    # 手动给每一列命名
    # 这样后面就可以按名字取列，而不是按列号取

    df = df[["date", "close", "open", "high", "low", "volume"]]
    # 重新整理列顺序，并去掉当前暂时用不到的 stock_id
    #
    # 虽然 MACD 真正核心只用到了 close，
    # 但保留这些列对后面继续画别的图还有帮助

    df["date"] = pd.to_datetime(df["date"])
    # 把 date 从文本转换成真正的日期类型
    # 这样以后如果要按日期画图、筛选时间，都会更规范

    return df


def calc_macd(df, fastperiod=12, slowperiod=26, signalperiod=9):
    """
    计算 MACD 指标

    这是一个"工具函数"
    它的工作很专一：
    你先把一张 DataFrame 表 `df` 给它，
    它再帮你算出 MACD 的三列结果。

    它为什么叫工具函数：
    因为它不会自己去读文件，
    也不会自己去找数据，
    它只负责"算"

    参数:
        df: 包含 close 列的 DataFrame
        fastperiod: 快线 EMA 周期，默认 12
        slowperiod: 慢线 EMA 周期，默认 26
        signalperiod: DEA 平滑周期，默认 9

    返回:
        新增 dif、dea、bar 三列的 DataFrame
    """
    # 这里几个参数的意思：
    #
    # `df`
    # 这是必须传进来的参数
    # 表示一张已经准备好的 DataFrame 表
    # 它至少要有 `close` 这一列
    #
    # `fastperiod=12`
    # 快线周期，默认 12
    #
    # `slowperiod=26`
    # 慢线周期，默认 26
    #
    # `signalperiod=9`
    # 信号线周期，默认 9
    #
    # 12、26、9 是 MACD 很常见的一组默认参数

    ewma12 = df["close"].ewm(span=fastperiod, adjust=False).mean()
    # 计算 12 日指数移动平均
    #
    # `df["close"]`
    # 先取出收盘价这一列
    #
    # `.ewm(...)`
    # ewm 是 pandas 里"指数加权移动平均"的工具
    # 你可以把它理解成：
    # 最近的数据权重更大，越早的数据权重更小
    #
    # `span=fastperiod`
    # 表示这里用 fastperiod，也就是 12
    #
    # `adjust=False`
    # 初学阶段你可以先理解成：
    # 使用一种更常见、更适合连续递推的 EMA 算法方式
    #
    # `.mean()`
    # 表示真正把 EMA 算出来

    ewma26 = df["close"].ewm(span=slowperiod, adjust=False).mean()
    # 计算 26 日指数移动平均
    # 逻辑和上一行一样，只是周期从 12 变成了 26

    df["dif"] = ewma12 - ewma26
    # dif 是快线减慢线
    #
    # 如果短期趋势比中期趋势更强，
    # 那么 ewma12 通常更容易高于 ewma26，
    # dif 就更容易变大

    df["dea"] = df["dif"].ewm(span=signalperiod, adjust=False).mean()
    # dea 是对 dif 再做一次指数平滑
    #
    # 你可以把它理解成：
    # dif 是变化更快的线
    # dea 是更平滑一点的信号线

    df["bar"] = (df["dif"] - df["dea"]) * 2
    # bar 是 MACD 柱状图的值
    #
    # 这里写成：
    # (dif - dea) * 2
    #
    # 为什么乘以 2：
    # 这是很多常见软件里常用的一种显示方式
    # 这样柱子更明显

    return df
    # 最后把"新增了 dif / dea / bar 三列"的表返回出去
    #
    # 这一步非常重要
    # 工具函数算完后，要把结果交还给外面继续用


def plot_macd():
    """
    画 MACD 图

    这是一个"完整流程函数"
    和 `calc_macd()` 的区别是：
    - `calc_macd()` 只负责算
    - `plot_macd()` 负责把整套流程串起来

    它会：
    1. 找文件
    2. 读 CSV
    3. 给列命名
    4. 转换日期
    5. 调用 calc_macd(df)
    6. 画 MACD 图
    7. 保存为文件
    """
    df = read_stock_data()
    # 调用前面写好的函数，读取并整理数据

    df_macd = calc_macd(df)
    # 这是整段代码最关键的"连接点"
    #
    # 前面 `read_stock_data()` 已经把 DataFrame 准备好了
    # 现在把它传给工具函数 `calc_macd(df)`
    #
    # 这就是正确用法：
    # 先有 df，再调用 calc_macd(df)

    print("=== MACD 数据预览 ===")
    print(df_macd[["date", "close", "dif", "dea", "bar"]].head(10))
    # 打印前 10 行数据，方便查看计算结果

    # 设置中文字体
    plt.rcParams["axes.unicode_minus"] = False
    # 让坐标轴里的负号更正常显示

    plt.rcParams["font.sans-serif"] = ["SimHei"]
    # 设置中文字体为黑体
    # 这样图标题和中文更容易正常显示

    plt.figure(figsize=(12, 6))
    # 创建一张新图，设置尺寸为 12x6

    df_macd["dea"].plot(color="red", label="dea")
    # 画 dea 线
    #
    # `color="red"`
    # 线条颜色设成红色
    #
    # `label="dea"`
    # 图例里显示 dea

    df_macd["dif"].plot(color="blue", label="dif")
    # 画 dif 线
    # 颜色设成蓝色

    plt.legend(loc="best")
    # 显示图例
    #
    # `loc="best"`
    # 表示让 matplotlib 自动选择比较合适的位置

    pos_bar = []
    pos_index = []
    neg_bar = []
    neg_index = []
    # 这里准备了 4 个列表
    #
    # 为什么要这样做：
    # 因为你想把 bar 柱子分成两类来画
    # - 大于 0 的一类
    # - 小于等于 0 的一类
    #
    # 这样后面就可以用不同颜色画它们

    for index, row in df_macd.iterrows():
        # iterrows() 表示按行遍历 DataFrame
        #
        # `index`
        # 是当前这一行的索引位置
        #
        # `row`
        # 是当前这一整行数据

        if row["bar"] > 0:
            pos_bar.append(row["bar"])
            pos_index.append(index)
        else:
            neg_bar.append(row["bar"])
            neg_index.append(index)
    # 这段循环的意思是：
    # 如果 bar 大于 0，就放进正柱子那一组
    # 否则放进负柱子那一组
    #
    # 为什么要这样做：
    # 因为 MACD 柱子常常希望按正负分颜色画
    # 这样图会更清楚

    plt.bar(pos_index, pos_bar, width=0.5, color="red")
    # 把大于 0 的柱子画出来
    # 用红色表示

    plt.bar(neg_index, neg_bar, width=0.5, color="green")
    # 把小于等于 0 的柱子画出来
    # 用绿色表示

    major_index = df_macd.index[df_macd.index]
    major_xtics = df_macd["date"][df_macd.index]
    # 这两行是在准备横坐标标签
    #
    # 第一行准备横坐标位置
    # 第二行准备横坐标要显示的日期文字
    #
    # 这里写法有点绕，但目前能工作
    # 你可以先记住它的目的：
    # "让横坐标显示日期"

    plt.xticks(major_index, major_xtics)
    # 把横坐标位置和横坐标文字真正设置上去

    plt.setp(plt.gca().get_xticklabels(), rotation=30)
    # 把横坐标日期文字旋转 30 度
    # 这样不容易挤在一起

    plt.grid(linestyle="-.")
    # 给图加网格，方便观察

    plt.title("MACD Indicator")
    # 设置图标题

    plt.tight_layout()
    # 让布局尽量紧凑

    # 保存图片
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / "macd.png", dpi=100)
    plt.close()
    print("Chart saved to output/macd.png")


"""
固定写法与可修改部分

1. 初学阶段建议不要乱改的固定写法
- `import pandas as pd`
- `from pathlib import Path`
- `df["close"].ewm(...).mean()`
- `df["date"] = pd.to_datetime(df["date"])`
- `df_macd = calc_macd(df)`
- `plt.savefig(...)`  服务器环境用这个，不要用 plt.show()

2. 可以根据需求修改的参数
- `DATA_FILE`
  可以改，改成不同 CSV 文件后，就会读取不同数据
- `fastperiod=12`
  可以改，表示快线 EMA 周期
- `slowperiod=26`
  可以改，表示慢线 EMA 周期
- `signalperiod=9`
  可以改，表示 DEA 的平滑周期
- `color="red"`、`color="blue"`、`color="green"`
  可以改，只影响图上颜色
- `width=0.5`
  可以改，只影响柱子宽度
- `rotation=30`
  可以改，只影响横坐标日期倾斜角度
- `plt.title(...)`
  可以改，只影响图标题


容易出错的地方

1. 把工具函数当成完整流程函数来调用
   `calc_macd()` 必须先传入 `df`
   不能直接空着写 `calc_macd()`

2. 忘记 CSV 没有表头
   如果漏掉 `header=None`，第一行真实数据会被当成列名

3. `close` 列如果不是数字，MACD 计算会出问题

4. `plt.show()` 少写括号
   图不会真正弹出来

5. 服务器环境用 plt.show() 而不是 plt.savefig()
   plt.show() 需要 GUI 环境，服务器上会报错


用生活化例子解释核心逻辑

你可以先把 MACD 的核心理解成：

"拿两条不同快慢的趋势线去比较，再看它们差得多不多。"

假设最近几天收盘价在慢慢上涨：

[10, 10.5, 11, 11.5, 12, 12.5]

那么：

1. 短周期 EMA（比如 12 日）会更快跟上最近价格
2. 长周期 EMA（比如 26 日）会更慢一些
3. 当价格开始走强时，短周期 EMA 更容易跑到长周期 EMA 上面
4. 这时：
   `dif = ewma12 - ewma26`
   就更容易变大

然后再对 `dif` 做一次平滑，
就得到 `dea`

最后：

`bar = (dif - dea) * 2`

如果 `dif` 比 `dea` 高很多，
柱子就会更大；
如果两者差距缩小，
柱子也会变短。

所以：
- `dif` 更像变化较快的线
- `dea` 更像平滑后的信号线
- `bar` 更像两者差距的柱状表现


学习总结

通过这份代码，你现在真正新学会了这些东西：

1. 什么是 MACD 的三部分：`dif`、`dea`、`bar`
2. 如何用 pandas 的 `ewm()` 计算指数移动平均
3. `calc_macd()` 为什么属于工具函数
4. `plot_macd()` 为什么属于完整流程函数
5. 如何把 MACD 结果画成线和柱子的组合图

这段代码在量化学习里的意义是：
- 它让你从"看价格"和"看均线"，继续进入"看技术指标"
- 后面无论是画更多指标、做策略、还是做回测，都很可能用到 MACD

你下一步很适合继续学：
1. 把 MACD 和 K 线图放到同一张图里
2. 学习红绿柱和正负柱分别代表什么
3. 学习 dif、dea 的交叉在图上怎么观察
4. 学习如何把这类指标进一步用到策略逻辑里
"""


# -------------------------------------------------------
# 主程序入口
# -------------------------------------------------------
if __name__ == "__main__":
    # 这是 Python 里很常见的主程序入口固定写法
    # 只有当你直接运行这个文件时，下面的代码才会执行

    print("=" * 50)
    print("  MACD 指标 - 计算并画图")
    print("=" * 50)

    plot_macd()

    print("\n" + "=" * 50)
    print("  运行完毕！图表已保存到 output/ 目录")
    print("=" * 50)
