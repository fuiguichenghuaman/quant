"""
第一部分：整体说明

这份文件对应的是：
`7_simple_trade_strategy_jq.py`

这次你学到的重点，是更系统地查看：

1. portfolio 总账户对象
2. subportfolios[0] 子账户对象
3. 多单仓位、空单仓位、总权益、累计收益、初始资金、持仓价值
4. 累计出入金、可用资金、可取资金、冻结资金、账户类型

这一步说明你已经开始真正走向"账户结构理解"。

前面是：
- 知道怎么买卖

现在是：
- 知道账户本身有哪些状态变量


第二部分：代码运行流程

1. `initialize(context)` 设置标的
2. 平台持续调用 `handle_data(context, data)`
3. 先执行简单买卖
4. 再把 portfolio 的整体信息打印出来
5. 再把 subportfolios[0] 的细节信息打印出来


第三部分：带详细中文注释的代码
"""


def initialize(context):
    # 设置交易标的
    g.security = "000001.XSHE"


def handle_data(context, data):
    # ============================================================
    # 一、简单买卖逻辑
    # ============================================================

    # 如果没有持仓，就买入 1000 股
    if g.security not in context.portfolio.positions:
        order(g.security, 1000)

    # 如果已经有持仓，就卖出 800 股
    else:
        order(g.security, -800)

    # ============================================================
    # 二、输出 portfolio 账户整体信息
    # ============================================================

    print("""多单的仓位：{}""".format(context.portfolio.long_positions))
    # long_positions：多头持仓集合
    # 对股票来说，通常最常见的是多头仓位

    print("""空单的仓位：{}""".format(context.portfolio.short_positions))
    # short_positions：空头持仓集合
    # 在普通 A 股学习阶段，这里很多时候可能为空
    # 但这个字段能帮助你认识平台账户结构更完整的样子

    print("""总权益：{}""".format(context.portfolio.total_value))
    # total_value：账户总权益
    #
    # 粗略理解：
    # 总权益 = 现金 + 持仓市值

    print("""总权益的累计收益：{}""".format(context.portfolio.returns))
    # returns：累计收益率
    #
    # 粗略数学公式：
    # 收益率 = (当前总权益 - 初始资金) / 初始资金

    print("""初始资金：{}""".format(context.portfolio.starting_cash))
    # starting_cash：初始资金
    # 也就是策略开始运行时账户的起点资金

    print("""持仓价值：{}""".format(context.portfolio.positions_value))
    # positions_value：当前持仓的总市值

    # ============================================================
    # 三、输出 subportfolios[0] 子账户信息
    # ============================================================

    print("""累计出入金：{}""".format(context.subportfolios[0].inout_cash))
    # inout_cash：累计出入金
    # 表示账户历史上累计转入或转出的资金
    #
    # 这和"投资收益"不是同一个概念

    print("""可用资金：{}""".format(context.subportfolios[0].available_cash))
    # available_cash：当前可用于下单的现金

    print("""可取资金：{}""".format(context.subportfolios[0].transferable_cash))
    # transferable_cash：可转出的资金
    # 它不一定等于可用资金
    # 因为有些资金虽然可用，但不一定立刻可转出

    print("""挂单锁住资金：{}""".format(context.subportfolios[0].locked_cash))
    # locked_cash：被挂单占住、暂时冻结的现金
    #
    # 金融含义：
    # 当你挂了还没成交的买单时，
    # 平台通常会先把一部分资金锁住

    print("""账户所属类型：{}""".format(context.subportfolios[0].type))
    # type：账户类型
    # 用来表示这个子账户属于什么类型的账户


"""
第四部分：逐段解释

第 1 段：portfolio 和 subportfolio 的区别

这是这份代码最核心的知识点。

你可以这样理解：

1. `portfolio`
   像"整个家庭总账本"

2. `subportfolios[0]`
   像"家庭总账本下面的某一个具体账户"

所以：

- `portfolio.total_value` 更偏整体视角
- `subportfolios[0].available_cash` 更偏子账户细节视角


第 2 段：几个最重要的账户字段

1. `starting_cash`
   初始资金

2. `total_value`
   当前总权益

3. `positions_value`
   当前持仓总市值

4. `returns`
   当前累计收益率

5. `available_cash`
   现在还能拿去下单的钱

6. `transferable_cash`
   现在可以转出的资金

7. `locked_cash`
   被挂单锁住、暂时不能动的钱


第 3 段：数学直觉

在最简单的理解里：

总权益 = 可用现金 + 持仓市值 + 其他现金项

累计收益率 ≈ (当前总权益 - 初始资金) / 初始资金

如果：

- 初始资金 = 100000
- 当前总权益 = 102000

那么：

收益率 ≈ (102000 - 100000) / 100000 = 2%


第 4 段：为什么要看 `locked_cash`

因为很多初学者会困惑：

"明明我还有钱，为什么有些钱不能继续下单？"

一个常见原因就是：

- 你之前挂了单
- 平台先把对应资金冻结了
- 所以它进入 `locked_cash`


第五部分：固定写法与可修改部分

固定写法：

1. `context.portfolio.long_positions`
2. `context.portfolio.short_positions`
3. `context.portfolio.total_value`
4. `context.portfolio.returns`
5. `context.subportfolios[0].available_cash`
6. `context.subportfolios[0].locked_cash`

可修改部分：

1. 买卖股数
2. 要打印哪些字段
3. 是否改成 `log.info` 输出


第六部分：容易出错的地方

1. `available_cash` 和 `transferable_cash` 不一样

2. `inout_cash` 不是收益
   它表示账户历史上的资金出入

3. `short_positions` 在普通 A 股学习场景下可能长期为空
   这不等于代码错了

4. `locked_cash` 不是"消失的钱"
   只是暂时冻结


第七部分：学习总结

你这份代码的价值很大，
因为它让你开始系统认识"账户报表"。

以后你做更复杂的策略时，
这些字段会经常被用来做：

1. 仓位管理
2. 资金控制
3. 风险约束
4. 交易状态诊断

下一步你很适合继续学：

1. 可卖数量
2. 冻结持仓
3. 持仓成本
4. 浮动盈亏
"""
