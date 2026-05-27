"""
第一部分：整体说明

这个文件是 `2_量化实战_KDJ策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. KDJ 指标在量化交易中怎么用来自动买卖

这份脚本主要完成了一件事情：
用 KDJ 指标的金叉死叉来自动买卖一只股票。

- K 值在 20 左右向上穿过 D 值 → 超卖区域金叉 → 全仓买入
- K 值在 80 左右向下穿过 D 值 → 超买区域死叉 → 全仓卖出

KDJ 是一个"超买超卖"型指标：
- K 和 D 都在 20 以下 → 股票可能被"超卖"了，价格偏低，该买
- K 和 D 都在 80 以上 → 股票可能被"超买"了，价格偏高，该卖

输入数据是什么：
- 这份代码运行在聚宽平台上，不需要自己准备数据
- 聚宽平台会自动提供股票的历史数据和 KDJ 指标计算函数

输出结果是什么：
- 在聚宽回测引擎里模拟买卖
- 通过 log.info() 输出买入、卖出和成交记录

代码运行的大致流程是什么：
1. initialize() 设置股票、交易费用、定时函数
2. before_market_open() 开盘前设置股票代码
3. market_open() 开盘时获取 KDJ 值，判断买卖信号
4. after_market_close() 收盘后打印成交记录

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 学完了双均线策略后，再学用 KDJ 指标做策略
- KDJ 比均线更灵敏，适合短线交易

第二部分：代码运行流程

这份脚本从上到下的大致运行顺序如下：

1. `import jqdata` 和 `from jqlib.technical_analysis import *`
   导入聚宽的数据和指标计算函数

2. `def initialize(context):`
   初始化函数，设置基准、交易费用、定时运行

3. `set_benchmark('000300.XSHG')`
   设置沪深300为比较基准

4. `set_order_cost(...)`
   设置交易费用（佣金、印花税）

5. `run_daily(before_market_open, time='before_open')`
   每天开盘前运行 before_market_open

6. `run_daily(market_open, time='open')`
   每天开盘时运行 market_open

7. `run_daily(after_market_close, time='after_close')`
   每天收盘后运行 after_market_close

8. `def before_market_open(context):`
   开盘前：设置要交易的股票

9. `def market_open(context):`
   开盘时：获取 KDJ 值，判断买卖

10. `K1, D1 = KD(security, ...)`
    调用聚宽的 KD() 函数获取 K 值和 D 值

11. `if K1[security] >= 20 and K1[security] > D1[security]:`
    买入条件：K 在 20 以上且 K > D

12. `elif K1[security] < 80 and K1[security] < D1[security]:`
    卖出条件：K 在 80 以下且 K < D

13. `def after_market_close(context):`
    收盘后：打印当天成交记录

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
- `def before_market_open(context):` — 聚宽要求的开盘前函数名
- `def market_open(context):` — 聚宽要求的开盘函数名
- `def after_market_close(context):` — 聚宽要求的收盘后函数名
- `run_daily()` — 聚宽的定时运行 API
- `KD()` — 聚宽的 KDJ 指标计算函数
- `set_order_cost()` — 聚宽的交易费用设置 API
- `order_value()` — 聚宽的按金额下单 API
- `order_target()` — 聚宽的按目标持仓下单 API

可以根据需求修改的参数：
- `g.security = '000001.XSHE'` — 可以改成别的股票代码
- `N=9, M1=3, M2=3` — KDJ 的参数，9 是周期，3 是平滑系数
- 买入条件 `K1[security] >= 20` — 可以改成 15、25 等
- 卖出条件 `K1[security] < 80` — 可以改成 70、85 等

第六部分：容易出错的地方

1. `KD()` 函数返回的是字典，不是单个值
   `K1[security]` 才是具体的 K 值，不能直接用 K1

2. 买入条件 `K1[security] >= 20` 不是"K 大于 20 就买"
   还需要同时满足 `K1[security] > D1[security]`（K > D）

3. 卖出条件还多了一个判断：`closeable_amount > 0`
   这是"可卖数量大于 0"，也就是当前有持仓才能卖

4. `order_value(security, cash)` 是"用多少现金买"
   不是"买多少股"

5. `context.portfolio.available_cash` 是"可用现金"
   不是"总资产"，已经买了股票的钱不算在里面

第七部分：用生活化例子解释核心逻辑

KDJ 指标就像一个"温度计"：
- K 值和 D 值都在 20 以下 → 股票"太冷了"（超卖）
  就像冬天温度太低，你该买羽绒服了 → 买入
- K 值和 D 值都在 80 以上 → 股票"太热了"（超买）
  就像夏天温度太高，你该卖羽绒服了 → 卖出

为什么要在 20 附近金叉才买，不是 K > D 就买？
因为如果 K 和 D 都在 50 附近交叉，可能是"假信号"。
只有在极端区域（20 以下或 80 以上）的交叉才更有意义。

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 如何用 KDJ 指标做量化策略
- 如何用聚宽的 KD() 函数获取 K、D 值
- 如何设置交易费用（佣金、印花税）
- 如何用 run_daily() 设置多个定时函数
- 如何在收盘后查看成交记录

接下来你可以：
- 改一下 KDJ 的参数（N=9, M1=3, M2=3），看看不同参数的效果
- 换一只股票试试
- 在聚宽平台上运行回测，对比双均线策略和 KDJ 策略的收益
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
KDJ 策略 —— 讲解版

以 K 在 20 左右向上交叉 D 时，全仓买入；
以 K 在 80 左右向下交叉 D 时，全仓卖出。
"""

# ---- 导入聚宽的库 ----
# jqdata 提供数据获取功能
# jqlib.technical_analysis 提供技术指标计算函数（如 KD、MA、RSI 等）
import jqdata
from jqlib.technical_analysis import *


# ---- 初始化函数 ----
# 聚宽要求的固定写法，回测开始时自动运行一次
def initialize(context):
    # ---- 设置基准 ----
    # 基准是用来对比你的策略收益和"大盘收益"的
    # 沪深300（000300.XSHG）是最常用的基准
    set_benchmark('000300.XSHG')

    # ---- 开启动态复权模式 ----
    # 复权就是处理股票分红、送股后的价格调整
    # use_real_price=True 表示用真实价格交易
    set_option('use_real_price', True)

    # ---- 设置交易费用 ----
    # 这是模拟真实交易的成本
    # open_tax=0: 买入时不收税
    # close_tax=0.001: 卖出时收千分之一的印花税
    # open_commission=0.0003: 买入佣金万分之三
    # close_commission=0.0003: 卖出佣金万分之三
    # min_commission=5: 每笔交易最低收 5 元
    set_order_cost(
        OrderCost(
            open_tax=0,
            close_tax=0.001,
            open_commission=0.0003,
            close_commission=0.0003,
            close_today_commission=0,
            min_commission=5
        ),
        type='stock'
    )

    # ---- 设置定时运行的函数 ----
    # before_market_open: 开盘前运行，参考沪深300的时间
    run_daily(
        before_market_open,
        time='before_open',
        reference_security='000300.XSHG'
    )

    # market_open: 开盘时运行
    run_daily(
        market_open,
        time='open',
        reference_security='000300.XSHG'
    )

    # after_market_close: 收盘后运行
    run_daily(
        after_market_close,
        time='after_close',
        reference_security='000300.XSHG'
    )


# ---- 开盘前运行的函数 ----
# 主要做一些准备工作，比如设置当天要交易的股票
def before_market_open(context):
    # 打印当前时间，方便调试
    log.info("""before_market_open运行时间：{}""".format(str(context.current_dt.time())))

    # 设置要交易的股票
    # "000001.XSHE" 是平安银行
    g.security = '000001.XSHE'


# ---- 开盘时运行的主函数 ----
# 这是策略的核心：获取 KDJ 值，判断买卖信号
def market_open(context):
    # 打印当前时间
    log.info("""market_open运行时间：{}""".format(str(context.current_dt.time())))

    # 获取要交易的股票代码
    security = g.security

    # ---- 获取 KDJ 指标的 K 值和 D 值 ----
    # KD() 是聚宽提供的 KDJ 指标计算函数
    # 参数说明：
    #   security: 股票代码
    #   check_date: 当前日期时间
    #   N=9: KDJ 的计算周期，9 是最常用的值
    #   M1=3: K 值的平滑系数
    #   M2=3: D 值的平滑系数
    # 返回值：K1 是一个字典，D1 也是一个字典
    # 用 K1[security] 才能拿到具体的 K 值
    K1, D1 = KD(
        security,
        check_date=context.current_dt,
        N=9,
        M1=3,
        M2=3
    )

    # ---- 获取当前可用现金 ----
    # available_cash 是账户里可以用来买股票的钱
    # 已经买了股票的钱不算在里面
    cash = context.portfolio.available_cash

    # ---- 买入信号判断 ----
    # 条件1：K1[security] >= 20 → K 值在 20 以上（刚从超卖区域出来）
    # 条件2：K1[security] > D1[security] → K 值大于 D 值（金叉）
    # 两个条件同时满足才买入
    if K1[security] >= 20 and K1[security] > D1[security]:
        # 打印买入日志
        log.info("""买入股票{}""".format(security))

        # order_value(security, cash) 用所有可用现金买入
        # 这是"全仓买入"的意思
        order_value(security, cash)

    # ---- 卖出信号判断 ----
    # 条件1：K1[security] < 80 → K 值在 80 以下（刚从超买区域下来）
    # 条件2：K1[security] < D1[security] → K 值小于 D 值（死叉）
    # 条件3：closeable_amount > 0 → 当前有可卖的持仓
    elif K1[security] < 80 and K1[security] < D1[security] and context.portfolio.positions[security].closeable_amount > 0:
        # 打印卖出日志
        log.info("""卖出股票{}""".format(security))

        # order_target(security, 0) 把持仓调整到 0 股
        # 也就是全部卖出
        order_target(security, 0)


# ---- 收盘后运行的函数 ----
# 主要用来查看当天的成交情况
def after_market_close(context):
    # 打印当前时间
    log.info("""after_market_close：{}""".format(str(context.current_dt.time())))

    # ---- 获取当天所有成交记录 ----
    # get_trades() 返回一个字典，包含当天所有成交的订单
    trades = get_trades()

    # 遍历每一笔成交记录并打印
    for _trade in trades.values():
        log.info("""成交记录：{}""".format(str(_trade)))

    log.info("""当天交易结束""")
