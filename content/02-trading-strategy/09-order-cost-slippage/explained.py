"""
第一部分：整体说明

这份文件对应的是：
`5.2_simple_trade_strategy_jq.py`

这次你的学习重点是：

1. 收盘后查看"成交记录"
2. 不只是看订单，而是看真正成交了什么
3. 学会区分：
   - order：下单
   - order object：订单对象
   - trade：成交记录

这是非常关键的一步。
因为在交易系统里：

- 下单不等于成交
- 订单对象不等于成交记录


第二部分：代码运行流程

1. `initialize(context)` 先运行
2. 每天 9:30 跑 `market_open(context)`
3. 每天 15:30 跑 `after_market_close(context)`
4. 收盘后通过 `get_trades()` 查看当天成交记录


第三部分：带详细中文注释的代码
"""


def initialize(context):
    # 设定业绩基准为"沪深300"
    set_benchmark('000300.XSHG')

    g.security = '000001.XSHE'
    # 设定交易标的

    run_daily(market_open, time='9:30')
    # 每天开盘时执行交易逻辑

    run_daily(after_market_close, time='15:30')
    # 每天收盘后查看成交记录


def market_open(context):
    # 如果没有持仓
    if g.security not in context.portfolio.positions:
        # 下单1000股
        order(g.security, 1000)
    else:
        # 卖出800股
        order(g.security, -800)


def after_market_close(context):
    print("闭市后")
    # 这是一个简单提示，表示现在执行的是收盘后逻辑

    # 得到所有的成交记录
    trades = get_trades()
    # get_trades() 是聚宽平台函数
    #
    # 作用：
    # 返回成交记录
    #
    # 注意：
    # 成交记录不是"订单"
    # 而是"真正撮合成交后的结果"

    for _trade in trades.values():
        print("""成交记录：{}""".format(_trade))
        # 打印整条成交记录对象

        print("""成交时间：{}""".format(_trade.time))
        # _trade.time 表示成交发生的时间

        print("""对应的订单id：{}""".format(_trade.order_id))
        # _trade.order_id 表示：
        # 这条成交记录是由哪一笔订单产生的
        #
        # 这非常重要，因为：
        # 一笔订单可能对应一条或多条成交记录


"""
第四部分：逐段解释

第 1 段：订单和成交记录的区别

很多初学者会把这两个概念混在一起：

1. 订单（Order）
   你发给市场的"交易请求"

2. 成交记录（Trade）
   市场真正撮合成功之后形成的结果

举个生活化例子：

你在外卖软件下单，这是"订单"；
骑手真的接单并送达，这是"实际完成记录"。

在交易里也是类似的：

- 你下单，不代表马上全部成交
- 一笔订单可能分几次成交


第 2 段：`get_trades()`

这段代码的作用是什么？

- 把已经发生的成交记录取出来

为什么重要？

因为如果你只看下单函数，
你只能知道"我发出过什么交易意图"

如果你看成交记录，
你才能知道"市场到底成交了什么"


第 3 段：`_trade.time`

这能帮助你回答：

- 是什么时候成交的？
- 是开盘立刻成交，还是后面才成交？

在做回测分析时，这个时间信息很有价值。


第 4 段：`_trade.order_id`

它能把"成交记录"和"原订单"连接起来。

你可以这样理解：

- order_id 像订单编号
- trade 是订单编号下面的一次具体成交


第五部分：固定写法与可修改部分

固定写法：

1. `get_trades()`
2. `trades.values()`
3. `_trade.time`
4. `_trade.order_id`

可改的：

1. 买卖股数
2. 调度时间
3. 打印哪些成交属性


第六部分：容易出错的地方

1. 不要把订单和成交记录当成一回事

2. `get_trades()` 返回的数据结构要看平台定义
   这里你用了 `.values()`，说明它很像字典结构

3. 没有成交时，循环可能不会输出任何内容
   这不一定是代码错了，也可能是真的没成交


第七部分：学习总结

这份代码让你开始真正理解：

1. 交易系统里"下单"和"成交"是两个阶段
2. 成交记录是回测分析非常重要的数据
3. 以后你分析策略时，不只要看收益曲线，还要看成交明细
"""
