"""
第一部分：整体说明

这个文件是 `6_量化实战_新能源轮动策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 行业轮动策略是怎么实现的

这份脚本主要完成了一件事情：
在新能源行业里，选出市净率（PB）最低的一只股票来持有。

什么是行业轮动？
- 行业轮动就是"在某个行业里挑最好的股票"
- 这个策略的思路是：新能源行业长期看好，但不同时期领涨的股票不同
- 所以每周检查一次，如果发现有更便宜的股票，就换过去

选股逻辑：
- 获取新能源指数（399808.XSHE）的成分股
- 按市净率（PB）从低到高排序
- 选市净率最低的那一只

交易逻辑：
- 如果当前持仓的股票不是 PB 最低的 → 卖出，买入 PB 最低的
- 如果当前没有持仓 → 直接买入 PB 最低的

输入数据是什么：
- 这份代码运行在聚宽平台上
- 聚宽提供新能源指数成分股和财务数据

输出结果是什么：
- 在聚宽回测引擎里模拟轮动交易
- 没有打印日志，但聚宽会自动记录交易

代码运行的大致流程是什么：
1. initialize() 设置基准、交易费用、定时函数
2. check_stocks() 每周一开盘前运行，选出 PB 最低的股票
3. trade() 每周一开盘时运行，根据选股结果买卖

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 从"单只股票策略"升级到"行业轮动策略"
- 学会了这个，你就知道量化基金是怎么做行业轮动的了

第二部分：代码运行流程

1. `def initialize(context):`
   初始化函数，设置基准、交易费用、定时函数

2. `run_weekly(check_stocks, weekday=1, time='before_open')`
   每周一开盘前运行选股函数

3. `run_weekly(trade, weekday=1, time='open')`
   每周一开盘时运行交易函数

4. `def check_stocks(context):`
   选股函数：获取新能源指数成分股 → 查询市净率 → 选最低的

5. `def trade(context):`
   交易函数：如果持仓不是最低 PB → 卖出买入最低 PB

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
- `def check_stocks(context):` — 选股函数名
- `def trade(context):` — 交易函数名
- `run_weekly()` — 聚宽的每周定时运行 API
- `get_index_stocks()` — 聚宽获取指数成分股的 API
- `get_fundamentals()` — 聚宽获取财务数据的 API
- `query()` — 聚宽的查询构造器
- `valuation.pb_ratio` — 聚宽的市净率字段
- `order_target()` — 聚宽的按目标持仓下单 API
- `order_value()` — 聚宽的按金额下单 API

可以根据需求修改的参数：
- `'399808.XSHE'` — 新能源指数代码，可以改成其他行业指数
  - 399808.XSHE: 新能源指数
  - 000300.XSHG: 沪深300
  - 000905.XSHG: 中证500
- `weekday=1` — 每周几运行，1 是周一，5 是周五
- 可以改成每天运行，用 `run_daily()`

第六部分：容易出错的地方

1. `get_index_stocks('399808.XSHE')` 返回的是股票代码列表
   不是 DataFrame，可以直接遍历

2. `get_fundamentals()` 返回的是 DataFrame
   要用 `g.df['code'][0]` 才能拿到第一只股票的代码

3. `query()` 是聚宽的查询构造器
   语法类似 SQL，但不是 SQL

4. `valuation.pb_ratio` 是市净率
   市净率 = 股价 / 每股净资产
   市净率越低，说明股票越"便宜"

5. `order_target(stock, 0)` 是卖出
   `order_value(code, cash)` 是买入

第七部分：用生活化例子解释核心逻辑

想象你是一个新能源行业的基金经理：
- 你看好新能源行业，所以决定只在这个行业里选股
- 但新能源行业有很多股票，你只想买最"便宜"的那只
- "便宜"的判断标准是市净率（PB）

市净率就像"房价和地价的比值"：
- 市净率 < 1 → 房价比地价还低 → 可能被低估了
- 市净率 > 3 → 房价是地价的 3 倍 → 可能被高估了

每周检查一次：
- 如果发现有更便宜的股票（PB 更低）→ 把旧的卖了，买新的
- 如果当前持仓的还是最便宜的 → 不动

这就是"行业轮动"的基本思路。

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 什么是行业轮动策略
- 如何用 get_index_stocks() 获取指数成分股
- 如何用 get_fundamentals() 查询财务数据
- 如何用 query() 构造查询条件
- 什么是市净率（PB），怎么用来选股

接下来你可以：
- 换一个行业指数试试，比如沪深300、中证500
- 加上其他选股条件，比如市盈率（PE）、ROE
- 改成每天运行，看看效果有没有变化
- 在聚宽平台上运行回测，看看新能源轮动策略的收益曲线
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
新能源轮动策略 —— 讲解版

在新能源行业里，选出市净率（PB）最低的一只股票来持有
每周检查一次，如果发现有更便宜的股票，就换过去
"""

# ---- 导入聚宽的库 ----
import jqdata


# ---- 初始化函数 ----
def initialize(context):
    # ---- 设置基准 ----
    set_benchmark('000300.XSHG')

    # ---- 开启动态复权 ----
    set_option('use_real_price', True)

    # ---- 设置成交比例 ----
    set_option('order_volume_ratio', 1)

    # ---- 设置交易费用 ----
    # 买入佣金万分之三
    # 卖出佣金万分之三 + 千分之一印花税
    # 每笔最低 5 元
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

    # ---- 设置定时运行 ----
    # 每周一开盘前运行选股函数
    run_weekly(check_stocks, weekday=1, time='before_open')

    # 每周一开盘时运行交易函数
    run_weekly(trade, weekday=1, time='open')


# ---- 选股函数 ----
# 每周一开盘前运行
def check_stocks(context):
    # ---- 获取新能源指数的成分股 ----
    # "399808.XSHE" 是新能源指数
    # get_index_stocks() 返回成分股的代码列表
    g.stocks = get_index_stocks('399808.XSHE')

    # ---- 查询市净率 ----
    # get_fundamentals() 查询财务数据
    # query() 构造查询条件：
    #   valuation.code: 股票代码
    #   valuation.pb_ratio: 市净率
    # .filter(): 过滤条件
    #   valuation.code.in_(g.stocks): 只查新能源成分股
    # .order_by(): 排序
    #   valuation.pb_ratio.asc(): 按市净率升序排列
    if len(g.stocks) > 0:
        g.df = get_fundamentals(
            query(
                valuation.code,
                valuation.pb_ratio
            ).filter(
                valuation.code.in_(g.stocks)
            ).order_by(
                valuation.pb_ratio.asc()
            )
        )

        # ---- 选出市净率最低的一只 ----
        # g.df['code'][0] 是排序后第一只股票的代码
        g.code = g.df['code'][0]


# ---- 交易函数 ----
# 每周一开盘时运行
def trade(context):
    if len(g.stocks) > 0:
        code = g.code

        # ---- 卖出逻辑 ----
        # 如果当前持仓的股票不是 PB 最低的，就卖出
        for stock in context.portfolio.positions.keys():
            if stock != code:
                # order_target(stock, 0) 卖出
                order_target(stock, 0)

        # ---- 买入逻辑 ----
        # 如果当前已经有持仓，就不再买入
        if len(context.portfolio.positions) > 0:
            return
        # 如果当前没有持仓，就用全部现金买入 PB 最低的股票
        else:
            order_value(code, context.portfolio.cash)
