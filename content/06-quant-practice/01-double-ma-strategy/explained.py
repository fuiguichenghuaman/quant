"""
第一部分：整体说明

这个文件是 `1_量化实战_双均线策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 量化交易里"金叉""死叉"这些概念，代码里是怎么落地的

这份脚本主要完成了一件事情：
用最简单的双均线交叉策略来买卖一只股票。

- 短期均线（MA5）从下往上穿过长期均线（MA10）→ 金叉 → 买入
- 短期均线（MA5）从上往下穿过长期均线（MA10）→ 死叉 → 卖出

这是量化交易里最经典的入门策略，几乎所有新手第一个学的策略就是它。

输入数据是什么：
- 这份代码运行在聚宽平台上，不需要自己准备 CSV 文件
- 聚宽平台会自动提供股票的历史数据

输出结果是什么：
- 在聚宽回测引擎里模拟买卖
- 通过 print() 输出买入和卖出的信号

代码运行的大致流程是什么：
1. 先定义 initialize() 初始化函数，设置股票、均线周期
2. 再定义 market_open() 函数，每个交易日开盘时运行
3. 在 market_open() 里获取均线数据，判断金叉死叉
4. 金叉买入，死叉卖出

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 是从"学指标"到"写策略"的关键一步
- 学完这个，你就知道量化交易到底是怎么"自动买卖"的了

第二部分：代码运行流程

这份脚本从上到下的大致运行顺序如下：

1. `def initialize(context):`
   聚宽平台的初始化函数，回测开始时自动运行一次

2. `g.security = "000333.XSHE"`
   设置要交易的股票代码（美的集团）

3. `g.short_count = 5`
   设置短期均线周期为 5 天

4. `g.long_count = 10`
   设置长期均线周期为 10 天

5. `run_daily(market_open, time="every_bar")`
   告诉聚宽：每个交易日的每个 bar 都运行一次 market_open 函数

6. `def market_open(context):`
   每个交易日开盘时运行的主函数

7. `short_ma = get_ma(g.security, g.short_count, g.unit)`
   获取 MA5 的当前值和上一次的值

8. `long_ma = get_ma(g.security, g.long_count, g.unit)`
   获取 MA10 的当前值和上一次的值

9. `if get_golden_signal(short_ma, long_ma):`
   判断是否金叉，如果是就买入

10. `elif get_death_signal(short_ma, long_ma):`
    判断是否死叉，如果是就卖出

11. `def get_ma(security, count, unit):`
    计算均线的辅助函数

12. `def get_golden_signal(short_ma, long_ma):`
    判断金叉的辅助函数

13. `def get_death_signal(short_ma, long_ma):`
    判断死叉的辅助函数

第三部分：带详细中文注释的代码
第四部分：逐行 / 逐段解释

下面这份代码会在关键地方加很细的中文注释。
注释里不仅解释"这行做什么"，还会解释：
- 为什么要这样写
- 上一段和下一段是什么关系
- 改动这里会有什么影响
- 哪些地方是固定写法
- 哪些地方是参数，可以改

第五部分：固定写法与可修改部分

初学阶段建议不要乱改的固定写法：
- `def initialize(context):` — 聚宽要求的初始化函数名
- `def market_open(context):` — 聚宽要求的开盘函数名
- `run_daily()` — 聚宽的定时运行 API
- `attribute_history()` — 聚宽获取历史数据的 API
- `order_target()` — 聚宽的下单 API

可以根据需求修改的参数：
- `g.security = "000333.XSHE"` — 可以改成别的股票代码
- `g.short_count = 5` — 可以改成 3、10 等，短期均线周期
- `g.long_count = 10` — 可以改成 20、60 等，长期均线周期
- `g.unit = "1d"` — 可以改成 "1w"（周线）等

第六部分：容易出错的地方

1. 金叉和死叉的判断逻辑不能写反
   金叉是"短均线从下穿上"，死叉是"短均线从上穿下"

2. `get_ma()` 函数里用了 `rolling(count).mean()`
   这是 Pandas 的滑动窗口平均函数，不是 NumPy 的

3. `attribute_history()` 是聚宽的 API，不能在本地 Python 里直接用
   这份代码只能在聚宽平台上运行

4. `order_target(g.security, 100)` 的意思是"把持仓调整到 100 股"
   不是"买入 100 股"，如果已经有 200 股，它会卖出 100 股

5. `order_target(g.security, 0)` 的意思是"把持仓调整到 0 股"
   也就是全部卖出

第七部分：用生活化例子解释核心逻辑

想象你去菜市场买菜：
- 你观察大白菜最近 5 天的平均价格（MA5）
- 你同时观察大白菜最近 10 天的平均价格（MA10）
- 如果最近 5 天的平均价开始超过 10 天的平均价
  说明价格在涨，你赶紧买 → 这就是"金叉买入"
- 如果最近 5 天的平均价开始低于 10 天的平均价
  说明价格在跌，你赶紧卖 → 这就是"死叉卖出"

为什么用两条均线而不是一条？
因为一条均线只能告诉你"现在价格是多少"，
两条均线交叉才能告诉你"趋势正在改变"。

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 什么是金叉和死叉
- 如何用聚宽 API 获取历史数据
- 如何用 rolling() 计算滑动平均
- 如何用 run_daily() 设置定时运行
- 如何用 order_target() 进行买卖

这些是量化交易最基础的"骨架"，后面所有更复杂的策略
都是在这个骨架上加更多条件和判断。

接下来你可以：
- 改一下 g.short_count 和 g.long_count，看看不同周期的效果
- 换一只股票试试，比如 "600519.XSHG"（贵州茅台）
- 在聚宽平台上运行回测，看看收益曲线
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
双均线策略 —— 讲解版
金叉时买入，死叉时卖出
"""

# ---- 初始化函数 ----
# 这是聚宽平台要求的固定写法
# 每次回测开始时，聚宽会自动调用这个函数一次
# context 是聚宽传进来的"上下文对象"，包含账户信息等
def initialize(context):
    # ---- 设置交易标的 ----
    # g.security 存储要交易的股票代码
    # "000333.XSHE" 是美的集团在聚宽平台上的代码
    # XSHE 表示深圳交易所，XSHG 表示上海交易所
    g.security = "000333.XSHE"

    # ---- 短期均线周期 ----
    # 5 日均线，就是最近 5 天收盘价的平均值
    # 这个数字可以改，比如改成 3 就更灵敏，改成 10 就更平滑
    g.short_count = 5

    # ---- 长期均线周期 ----
    # 10 日均线，就是最近 10 天收盘价的平均值
    # 通常长期均线要比短期均线大，比如 10、20、60
    g.long_count = 10

    # ---- 数据周期 ----
    # "1d" 表示日线数据，每天一个数据点
    # 还可以改成 "1w"（周线）、"1m"（月线）等
    g.unit = "1d"

    # ---- 设置定时运行 ----
    # run_daily() 告诉聚宽：每个交易日都运行一次 market_open 函数
    # time="every_bar" 表示每个 bar（每个时间点）都运行
    # 如果改成 time="open"，就只在开盘时运行一次
    run_daily(market_open, time="every_bar")


# ---- 每个交易日运行的主函数 ----
# 这个函数在每个交易日的每个 bar 都会被聚宽自动调用
# context 是聚宽传进来的上下文对象
def market_open(context):
    # ---- 获取短期均线 ----
    # 调用我们自己写的 get_ma() 函数
    # 返回一个列表：[上一次的MA值, 当前的MA值]
    short_ma = get_ma(g.security, g.short_count, g.unit)

    # ---- 获取长期均线 ----
    long_ma = get_ma(g.security, g.long_count, g.unit)

    # ---- 判断金叉 → 买入 ----
    # 如果短期均线从下往上穿过长期均线，就是"金叉"
    # 这时候趋势可能要上涨了，所以买入
    if get_golden_signal(short_ma, long_ma):
        # 打印日志，方便在聚宽控制台查看
        print(f"金叉买入，MA{g.short_count}={short_ma}，MA{g.long_count}={long_ma}")
        # order_target() 把持仓调整到 100 股
        # 如果当前没有持仓，就买入 100 股
        # 如果当前有 200 股，就卖出 100 股
        order_target(g.security, 100)

    # ---- 判断死叉 → 卖出 ----
    # 如果短期均线从上往下穿过长期均线，就是"死叉"
    # 这时候趋势可能要下跌了，所以卖出
    elif get_death_signal(short_ma, long_ma):
        print(f"卖出所有股票，MA{g.short_count}={short_ma}，MA{g.long_count}={long_ma}")
        # order_target(security, 0) 把持仓调整到 0 股
        # 也就是全部卖出
        order_target(g.security, 0)


# ---- 计算均线的辅助函数 ----
# 这个函数负责获取某只股票的均线值
# security: 股票代码
# count: 均线周期（比如 5 或 10）
# unit: 数据周期（比如 "1d"）
def get_ma(security: str, count: int, unit: str) -> list:
    # ---- 获取历史数据 ----
    # attribute_history() 是聚宽的 API，获取股票的历史数据
    # 参数：股票代码、获取天数、数据周期、需要的字段
    # 这里获取 count+1 天的收盘价，多取 1 天是为了能算"上一次的 MA"
    df = attribute_history(security, count + 1, unit, ["close"])

    # ---- 计算当前的 MA ----
    # df[:count + 1]["close"] 取前 count+1 天的收盘价
    # .rolling(count).mean() 计算滑动窗口平均值
    # [-1] 取最后一个值，就是"当前的 MA"
    now_ma = df[:count + 1]["close"].rolling(count).mean()[-1]

    # ---- 计算上一次的 MA ----
    # df[:count] 取前 count 天的收盘价（比上面少取 1 天）
    # 这样算出来的就是"上一次的 MA"
    pre_ma = df[:count]["close"].rolling(count).mean()[-1]

    # 返回 [上一次的MA, 当前的MA]
    return [pre_ma, now_ma]


# ---- 判断是否金叉 ----
# 金叉：短期均线从下往上穿过长期均线
# 条件：上一次 short_ma < long_ma，当前 short_ma >= long_ma
def get_golden_signal(
        short_ma: list,
        long_ma: list
) -> bool:
    # short_ma[0] 是上一次的短期均线值
    # short_ma[1] 是当前的短期均线值
    # long_ma[0] 是上一次的长期均线值
    # long_ma[1] 是当前的长期均线值
    return short_ma[0] < long_ma[0] and short_ma[1] >= long_ma[1]


# ---- 判断是否死叉 ----
# 死叉：短期均线从上往下穿过长期均线
# 条件：上一次 short_ma > long_ma，当前 short_ma <= long_ma
def get_death_signal(
        short_ma: list,
        long_ma: list
) -> bool:
    return short_ma[0] > long_ma[0] and short_ma[1] <= long_ma[1]
