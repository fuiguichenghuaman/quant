"""
第一部分：整体说明

这个模块合并了两份聚宽策略源码的学习内容：

- `2_simple_trade_strategy_jq.py`：学习回测环境设置（手续费、滑点、基准、成交量限制）
- `3_simple_trade_strategy_jq.py`：学习按月调度和回测结果差异分析

你这次学到的内容，和前面 MA5 策略相比，又往前走了一大步：

1. 不再只关心"什么时候买、什么时候卖"
2. 开始加入"基准""手续费""滑点""成交量限制""真实价格模式"这些更接近真实交易环境的设置
3. 学习不同的调度频率（run_daily vs run_monthly）
4. 开始思考"为什么同样代码，和别人回测出来的收益可能不一样"

这说明你已经从"只看策略信号"，进入到了"开始理解策略运行环境"的阶段。


第二部分：代码运行流程

这份聚宽脚本的运行顺序是：

1. 平台加载策略代码
2. 先调用一次 `initialize(context)`
3. `initialize()` 里完成所有环境配置：
   - 设定交易标的
   - 设定比较基准
   - 注册定时执行函数
   - 设定手续费模型
   - 设定滑点模型
   - 设定成交量限制
   - 开启真实价格模式
4. 平台按注册规则，在每天 9:30 调用 `market_open(context)`
5. `market_open()` 里执行买卖逻辑

`initialize()` 更像"启动配置函数"，
`market_open()` 更像"每天执行的交易函数"。

你可以把它理解成：
1. `initialize()`：先布置实验室
2. `market_open()`：每天开盘时按规则操作


第三部分：这份代码里的关键设置

在开始逐行讲之前，先把最重要的几个概念说清楚。


概念 1：set_benchmark —— 设定比较基准

```python
set_benchmark('000300.XSHG')
```

这表示用沪深 300 指数作为"对照组"。

以后回测时，不只看自己赚没赚钱，
还要看自己的策略表现，相比沪深 300 怎么样。

这有点像考试时不只看你考了多少分，还要看班级平均分是多少。


概念 2：set_order_cost —— 设定交易成本

```python
set_order_cost(
    OrderCost(
        open_commission=0.03,
        close_commission=0.03,
        close_today_commission=0.001,
        min_commission=5
    ),
    type='stock'
)
```

这段代码在设置"每次交易要扣多少钱"。

参数含义：
- open_commission：买入佣金比例
- close_commission：卖出佣金比例
- close_today_commission：平今仓佣金（期货更常见，股票不太关键）
- min_commission：最低佣金，即使按比例算出来很少，也至少收 5 元

数学上可以粗略理解为：
买入佣金 = max(成交金额 * open_commission, min_commission)

重要提醒：
这里写的 0.03 = 3%，通常比股票真实交易佣金高很多。
常见学习示例更接近 0.0003 = 万分之三。
代码"语法上没错"，但"金融含义上值得再次确认"。


概念 3：set_slippage —— 设定滑点

```python
set_slippage(PriceRelatedSlippage(0.002), type='stock')
```

什么叫滑点？
你下单时以为能按某个理想价格成交，
但真实交易里，实际成交价常常会偏一点。

PriceRelatedSlippage(0.002) 表示按价格比例计算滑点，
0.002 = 0.2%。

核心思想：回测不要默认永远按最理想价格成交。


概念 4：set_option —— 平台选项

```python
set_option('order_volume_ratio', 0.5)
set_option('use_real_price', True)
```

order_volume_ratio = 0.5 表示：
单笔订单的成交量不要超过当日总成交量的 50%。
这是为了防止回测里"想买多少就买多少"导致结果失真。

use_real_price = True 表示：
开启真实价格模式，让回测中的成交价格更接近真实交易语境。

注意：原代码中这里写成了 `Ture`，正确应该是 `True`。
`Ture` 不是 Python 认识的关键字，会导致 NameError。


概念 5：order() —— 按股数下单

```python
order(g.security, 1000)   # 买入 1000 股
order(g.security, -800)   # 卖出 800 股
```

和前面学的 `order_value()`（按金额下单）、`order_target()`（按目标持仓下单）不同，
`order()` 是按股数下单：
- 正数表示买入
- 负数表示卖出


概念 6：run_daily vs run_monthly —— 调度频率

```python
run_daily(market_open, time='9:30')     # 每天 9:30 执行
run_monthly(market_open, 1, time='open')  # 每月第 1 个交易日开盘执行
```

调度频率不同，策略行为会完全不同。
"每个月第 1 个交易日"不一定是自然月 1 号，它指的是交易日。


第四部分：带详细中文注释的代码
"""


def initialize(context):
    # initialize(context) 是聚宽平台规定好的"初始化函数"
    #
    # 这个函数不会由你自己手动调用，
    # 而是由聚宽平台在策略启动时自动调用一次。
    #
    # 你可以把它理解成：
    # "这份策略刚开始运行时，先做哪些准备工作"

    g.security = '000001.XSHE'
    # g 是聚宽里常见的"全局变量容器"
    #
    # 作用：
    # 把后面多个函数都要用到的变量，先统一存起来
    #
    # '000001.XSHE' 是聚宽里股票代码的写法：
    # - 000001 是证券代码
    # - XSHE 表示深圳证券交易所

    set_benchmark('000300.XSHG')
    # set_benchmark(...) 是聚宽平台函数
    #
    # 作用：设置"比较基准"
    # '000300.XSHG' 表示沪深 300 指数
    #
    # 基准的金融含义：
    # 回测时不只看自己赚没赚钱，
    # 还要看策略表现相比一个常见市场基准怎么样

    run_daily(market_open, time='9:30')
    # run_daily(...) 是聚宽平台的调度函数
    #
    # 作用：告诉平台"每天在指定时间执行某个函数"
    #
    # market_open 是函数名，不要加括号
    # 因为这里传的是"函数本身"，不是"现在立刻执行函数"
    #
    # time='9:30' 表示每天 9:30 调用一次 market_open(context)

    set_order_cost(
        OrderCost(
            open_commission=0.03,
            close_commission=0.03,
            close_today_commission=0.001,
            min_commission=5
        ),
        type='stock'
    )
    # set_order_cost(...) 设置交易成本模型
    #
    # 外层 set_order_cost(cost, type='stock')
    # 内层 OrderCost(...) 描述交易成本参数
    #
    # open_commission=0.03：买入佣金比例（这里 3% 通常偏高）
    # close_commission=0.03：卖出佣金比例
    # close_today_commission=0.001：平今仓佣金
    # min_commission=5：最低佣金 5 元
    # type='stock'：对股票生效
    #
    # 常见学习示例更接近 0.0003 = 万分之三

    set_slippage(PriceRelatedSlippage(0.002), type='stock')
    # set_slippage(...) 设置滑点模型
    #
    # PriceRelatedSlippage(0.002) 表示按价格比例的滑点
    # 0.002 = 0.2%
    #
    # 金融含义：回测不要默认永远按最理想价格成交

    set_option('order_volume_ratio', 0.5)
    # 限制单笔订单成交量
    # 0.5 表示单笔最大成交量约为当日总成交量的 50%
    #
    # 为什么需要？
    # 防止回测里"想买多少就买多少"导致结果失真

    set_option('use_real_price', True)
    # 开启真实价格模式
    # 让回测或模拟交易中的成交价格更接近真实交易语境
    #
    # 注意：原代码写的是 Ture，正确应该是 True
    # Ture 不是 Python 关键字，会导致 NameError


def market_open(context):
    # market_open(context) 是真正执行交易动作的函数
    #
    # 平台会根据 run_daily(...) 的设置，
    # 每天在 9:30 自动调用它

    if g.security not in context.portfolio.positions:
        # 判断：当前持仓里有没有这只股票
        #
        # context.portfolio.positions
        # 是聚宽平台维护的"当前持仓字典"
        #
        # 如果 g.security 不在里面，
        # 说明当前没有持有这只股票

        order(g.security, 1000)
        # order(...) 是聚宽平台的按股数下单函数
        #
        # 正数表示买入，这里买入 1000 股
        #
        # 和 order_value()（按金额）、order_target()（按目标仓位）不同

    else:
        # 能进入 else，表示当前已经持有这只股票

        order(g.security, -800)
        # 负数表示卖出，这里卖出 800 股
        #
        # 如果前面买的是 1000 股，
        # 卖完 800 股后还剩 200 股
        #
        # 后面再运行一天时，仍然有持仓，还会继续执行卖出逻辑
        #
        # 所以这份策略的实际节奏大致是：
        # 第 1 天：没有持仓 -> 买 1000 股
        # 第 2 天：已有持仓 -> 卖 800 股，剩 200 股
        # 第 3 天：仍有持仓 -> 再尝试卖 800 股（实际以平台允许为准）
        #
        # 一共是三天一个周期

        # 第一次卖出800，剩下200，所以还要再卖一次800，会自动下单检查标的数量，所以是买入1000花费一天时间
        # 卖出800两次，需要两天才能清仓
        # 一共是三天一个周期


"""
第五部分：为什么同样代码，回测结果可能不一样

这是一个非常重要的学习点。

你在学习聚宽策略时，可能发现：
- 博主视频里的策略收益大约是 -0.86%
- 自己在聚宽平台上运行，同样区间、同样初始资金、同样代码，策略收益大约是 -0.74%

这不是代码写错了，而是"回测环境细节"的差异。

影响结果的因素包括：

1. 回测引擎版本
2. 平台默认手续费
3. 平台默认滑点
4. 是否使用真实价格模式
5. 复权价格口径
6. 成交价格规则
7. 回测频率
8. 策略克隆时保留的历史设置
9. 平台后来是否更新了默认参数

所以量化学习里，不能只盯着"收益数字差了多少"，
更重要的是问："这次实验的环境条件和对方是否完全一样？"

如何让自己的回测更可复现？
在 initialize() 中显式写清楚：
- set_option('use_real_price', True)
- set_slippage(...)
- set_order_cost(...)

这样做的好处是：
- 回测环境更明确
- 自己重复运行更容易复现
- 不容易因为平台默认参数变化导致结果解释困难


第六部分：固定写法与可修改部分

初学阶段建议不要乱改的固定写法：

1. `def initialize(context):`
2. `def market_open(context):`
3. `run_daily(market_open, time='9:30')` 的函数调用结构
4. `set_option('use_real_price', True)`
5. `type='stock'`

可以根据需求修改的部分：

1. `g.security` —— 换一只股票
2. `set_benchmark('000300.XSHG')` —— 换比较基准
3. `time='9:30'` —— 换执行时间
4. `open_commission` / `close_commission` —— 调整手续费
5. `PriceRelatedSlippage(0.002)` —— 调整滑点
6. `order_volume_ratio` —— 调整成交量限制
7. `1000` / `-800` —— 调整买卖股数


第七部分：容易出错的地方

1. `Ture` 和 `True`
   Python 区分大小写和拼写
   `Ture` 不是布尔值，会报错

2. 平台函数不是普通 Python 自带函数
   set_benchmark、run_daily、set_order_cost、set_slippage、set_option、order
   这些都依赖聚宽平台环境

3. 佣金参数的小数位很容易写错
   0.03 和 0.0003 差了 100 倍

4. `order(g.security, -800)` 不表示"无论如何都一定卖掉 800 股"
   平台最终还会检查实际可卖数量

5. use_real_price=True 后，价格序列的理解要更小心
   不能简单跨日期缓存比较价格而不考虑复权语境

6. "每个月第 1 个交易日"不一定是自然月 1 号
   它指的是交易日，不是日历日


第八部分：用生活化例子解释核心逻辑

假设策略规则是：
- 没持仓 -> 买 1000 股
- 有持仓 -> 卖 800 股

那么会发生什么？

第 1 天：
- 当前没有这只股票
- 进入 if
- 买入 1000 股

第 2 天：
- 当前已经持有 1000 股
- 进入 else
- 卖出 800 股
- 剩下 200 股

第 3 天：
- 当前仍然有持仓
- 再次进入 else
- 又尝试卖 800 股
- 实际最终以平台允许卖出的数量为准

所以这份代码的核心不是"预测涨跌"，
而是"演示平台持仓如何跨天变化，订单如何影响仓位"。

这对学习交易系统很有帮助，
因为你正在从"指标学习"走向"账户状态学习"。


第九部分：数学角度补充理解

1. 佣金

如果某次买入成交金额为：
成交金额 = 价格 * 股数

买入佣金 = max(成交金额 * 买入佣金率, 最低佣金)

比如：价格 10 元，买入 1000 股，成交金额 = 10000 元
- 佣金率 0.03：佣金 = max(10000 * 0.03, 5) = 300 元（非常高）
- 佣金率 0.0003：佣金 = max(10000 * 0.0003, 5) = 5 元（更合理）

2. 成交量比例限制

如果当日总成交量是 V，order_volume_ratio = 0.5，
单笔最大成交量约 = V * 0.5

表示：一笔订单不要吃掉超过 50% 的市场成交量。

3. 滑点

如果市场理想价格是 P，滑点比例 s = 0.002，
实际成交价会围绕 P 发生偏移。
核心思想：实际成交价 != 理想价格。


第十部分：学习总结

通过这个模块，你真正开始接触了交易系统层面的概念：

1. 聚宽策略不是普通脚本，而是平台调度脚本
2. initialize() 是初始化入口，负责环境配置
3. run_daily() / run_monthly() 决定什么时候执行交易函数
4. market_open() 里才是真正的交易动作
5. set_benchmark() 决定比较基准
6. set_order_cost() 决定交易成本模型
7. set_slippage() 决定成交价偏移模型
8. set_option() 可以影响真实价格模式和成交量限制
9. order() 是按股数下单（区别于 order_value 和 order_target）
10. context.portfolio.positions 是持仓字典，可以判断有没有持仓
11. 回测结果不仅由策略逻辑决定，还受平台环境影响
12. 平台策略学习不能只看"能不能跑"，还要看"参数金融含义是否写对"

下一步建议学什么：

1. 深入学习 context.portfolio 的更多属性（总资产、持仓市值、收益率等）
2. 学习 context.portfolio.positions 里每个持仓对象的属性
3. 学习子账户概念
4. 尝试在策略中加入日志，打印每天的账户状态
5. 比较不同调度频率下策略行为的差异
"""


if __name__ == "__main__":
    # 这份文件是"聚宽平台源码讲解版"
    # 重点是阅读和学习，不是拿来本地直接跑策略
    print("这是聚宽平台源码讲解版文件，主要用于阅读、学习和复盘。")
