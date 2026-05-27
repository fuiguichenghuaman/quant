"""
第一部分：整体说明

这个文件是 `7_量化实战_低估值量化策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 低估值选股策略是怎么实现的

这份脚本主要完成了一件事情：
从沪深300成分股里，选出"低估值、低负债、流动性好"的股票来持有。

什么是低估值？
- 市净率（PB）< 1 → 股价比每股净资产还低
- 就像房子卖得比地价还便宜 → 可能被低估了

什么是低负债？
- 负债比例低于市场平均值
- 负债少的公司更安全，不容易倒闭

什么是流动性好？
- 流动资产 / 流动负债 > 1.2
- 说明公司短期内能还清债务

止损机制：
- 每天检查沪深300指数
- 如果 10 天内跌了 10% → 全部清仓

调仓机制：
- 每月调仓一次
- 每月 20 号检查，如果持仓的股票不再符合条件 → 卖出

输入数据是什么：
- 这份代码运行在聚宽平台上
- 聚宽提供沪深300成分股和财务数据

输出结果是什么：
- 在聚宽回测引擎里模拟选股和买卖
- 没有打印日志，但聚宽会自动记录交易

代码运行的大致流程是什么：
1. initialize() 设置参数和定时函数
2. broader_stoploss() 每天开盘时检查大盘止损
3. trade() 每月 20 号调仓
4. check_stocks() 选出符合条件的股票

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 学习用财务指标（PB、负债率、流动比率）选股
- 学习止损机制和定期调仓

第二部分：代码运行流程

1. `def initialize(context):`
   初始化函数，设置基准、持仓数量、调仓月份、定时函数

2. `run_daily(broader_stoploss, time='open')`
   每天开盘时检查大盘止损

3. `run_monthly(trade, monthday=20, time='open')`
   每月 20 号调仓

4. `def check_stocks(context):`
   选股函数：获取沪深300成分股 → 查询 PB、负债率、流动比率 → 筛选

5. `def broader_stoploss(context):`
   大盘止损函数：检查沪深300是否跌幅超过 10%

6. `def bm_stoploss(kernel=2, n=10, threshold=0.03):`
   止损计算函数：两种止损方法

7. `def trade(context):`
   交易函数：每月调仓，卖出不符合条件的，买入新符合条件的

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
- `def broader_stoploss(context):` — 止损函数名
- `def bm_stoploss()` — 止损计算函数名
- `def trade(context):` — 交易函数名
- `run_daily()` — 聚宽的每日定时运行 API
- `run_monthly()` — 聚宽的每月定时运行 API
- `get_index_stocks()` — 聚宽获取指数成分股的 API
- `get_fundamentals()` — 聚宽获取财务数据的 API
- `query()` — 聚宽的查询构造器
- `attribute_history()` — 聚宽获取历史数据的 API
- `order_target()` — 聚宽的按目标持仓下单 API
- `order_value()` — 聚宽的按金额下单 API

可以根据需求修改的参数：
- `g.stockindex = '000300.XSHG'` — 可以改成其他指数
- `g.stocknum = 5` — 最大持仓数量
- `f = 12` — 每年调仓次数，12 是每月一次
- `monthday=20` — 每月几号调仓
- `valuation.pb_ratio < 1` — 市净率阈值
- `total_current_assets / total_current_liability > 1.2` — 流动比率阈值
- `kernel=2, n=3, threshold=0.1` — 止损参数

第六部分：容易出错的地方

1. `get_fundamentals()` 返回的是 DataFrame
   要用 `stocks['code']` 才能拿到股票代码列表

2. `balance.total_assets` 等字段名是聚宽定义的
   不能自己乱改

3. `bm_stoploss()` 有两种止损方法
   `kernel=1` 是均线死叉止损，`kernel=2` 是跌幅止损

4. `run_monthly(trade, monthday=20, time='open')`
   如果 monthday=20 那天不是交易日，会顺延到下一个交易日

5. `g.transfer_date = list(range(1, 13, 12 // f))`
   这行代码计算的是哪些月份要调仓
   f=12 时，每月都调仓（1,2,3,...,12）

第七部分：用生活化例子解释核心逻辑

想象你是一个价值投资者：
- 你相信"便宜有好货"
- 你在沪深300里找"被低估的好公司"

选股标准：
1. 市净率 < 1 → 股价比净资产还低 → 便宜
2. 负债比例低于平均值 → 负债少 → 安全
3. 流动比率 > 1.2 → 短期不缺钱 → 健康

每月检查一次：
- 如果持仓的股票不再符合标准 → 卖掉
- 如果有新的股票符合标准 → 买入

止损机制：
- 如果大盘 10 天跌了 10% → 全部清仓
- 这是为了防止"黑天鹅"事件

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 如何用财务指标（PB、负债率、流动比率）选股
- 如何设置止损机制
- 如何设置定期调仓
- 什么是低估值策略
- 价值投资的量化实现

接下来你可以：
- 改一下 PB 阈值，比如 0.8 或 1.5
- 改一下持仓数量，看看 3 只和 10 只的区别
- 改一下调仓频率，比如每周或每季度
- 在聚宽平台上运行回测，看看低估值策略的收益曲线
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
低估值量化策略 —— 讲解版

选股条件：
- 市净率（PB）< 1
- 负债比例低于市场平均值
- 流动资产 / 流动负债 > 1.2

止损机制：
- 每天检查沪深300，10 天内跌 10% 就清仓

调仓机制：
- 每月 20 号调仓
"""

# ---- 导入聚宽的库 ----
import jqdata


# ---- 初始化函数 ----
def initialize(context):
    # ---- 设置基准 ----
    set_benchmark('000300.XSHG')

    # ---- 设置指数 ----
    g.stockindex = '000300.XSHG'

    # ---- 开启真实价格交易 ----
    set_option('use_real_price', True)

    # ---- 设置成交比例 ----
    set_option('order_volume_ratio', 1)

    # ---- 设置交易费用 ----
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

    # ---- 最大持仓数量 ----
    g.stocknum = 5

    # ---- 自动设定调仓月份 ----
    # f=12 表示每年调仓 12 次（每月一次）
    # g.transfer_date 是一个列表，包含要调仓的月份
    # range(1, 13, 1) 生成 [1, 2, 3, ..., 12]
    f = 12
    g.transfer_date = list(range(1, 13, 12 // f))

    # ---- 设置定时运行 ----
    # 每天开盘时检查大盘止损
    run_daily(broader_stoploss, time='open')

    # 每月 20 号调仓
    run_monthly(trade, monthday=20, time='open')


# ---- 选股函数 ----
# 从沪深300里选出符合条件的股票
def check_stocks(context):
    # ---- 获取沪深300成分股 ----
    security = get_index_stocks(g.stockindex)

    # ---- 查询财务数据 ----
    # get_fundamentals() 查询聚宽的财务数据库
    # query() 构造查询条件
    stocks = get_fundamentals(
        query(
            valuation.code,              # 股票代码
            valuation.pb_ratio,          # 市净率
            balance.total_assets,        # 总资产
            balance.total_liability,     # 总负债
            balance.total_current_assets,      # 流动资产
            balance.total_current_liability    # 流动负债
        ).filter(
            valuation.code.in_(security),  # 只查沪深300成分股

            # 条件1：市净率 < 1（低估值）
            valuation.pb_ratio < 1,

            # 条件2：流动资产 / 流动负债 > 1.2（流动性好）
            balance.total_current_assets / balance.total_current_liability > 1.2
        )
    )

    # ---- 计算负债比例 ----
    # 负债比例 = 总负债 / 总资产
    stocks['debt_asset'] = stocks['total_liability'] / stocks['total_assets']

    # ---- 计算负债比例的市场均值 ----
    median = stocks['debt_asset'].median()

    # ---- 筛选负债比例低于市场均值的股票 ----
    codes = stocks[stocks['debt_asset'] < median].code

    return list(codes)


# ---- 大盘止损函数 ----
# 每天开盘时运行
def broader_stoploss(context):
    # 调用止损计算函数
    # kernel=2: 使用跌幅止损方法
    # n=3: 检查最近 3 天（注意：这里参数传的是 3，但函数默认是 10）
    # threshold=0.1: 跌幅阈值 10%
    stoploss = bm_stoploss(kernel=2, n=3, threshold=0.1)

    # 如果触发止损，清仓
    if stoploss:
        if len(context.portfolio.positions) > 0:
            for stock in list(context.portfolio.positions.keys()):
                order_target(stock, 0)


# ---- 止损计算函数 ----
# 有两种止损方法
def bm_stoploss(kernel=2, n=10, threshold=0.03):
    """
    方法1：当天 n 日均线与昨日收盘价构成"死叉"，则为 True
    方法2：当天 n 日内跌幅超过阈值，则为 True
    """

    # ---- 止损方法1：均线死叉 ----
    if kernel == 1:
        t = n + 2

        # 获取沪深300最近 t 天的收盘价
        hist = attribute_history(
            '000300.XSHG',
            t,
            '1d',
            'close',
            df=False
        )

        # 计算 n 日均线
        temp1 = sum(hist['close'][1:-1]) / float(n)
        temp2 = sum(hist['close'][0:-2]) / float(n)

        close1 = hist['close'][-1]
        close2 = hist['close'][-2]

        # 如果昨天收盘价在均线上方，今天在均线下方 → 死叉
        if (close2 > temp2) and (close1 < temp1):
            return True
        else:
            return False

    # ---- 止损方法2：跌幅止损 ----
    elif kernel == 2:
        # 获取沪深300最近 n 天的收盘价
        hist1 = attribute_history(
            '000300.XSHG',
            n,
            '1d',
            'close',
            df=False
        )

        # 计算跌幅
        # (第一天收盘价 - 最后一天收盘价) / 第一天收盘价
        if (1 - float(hist1['close'][-1] / hist1['close'][0])) >= threshold:
            return True
        else:
            return False


# ---- 交易函数 ----
# 每月 20 号运行
def trade(context):
    # 获取当前月份
    months = context.current_dt.month

    # ---- 如果当前月是调仓月 ----
    if months in g.transfer_date:
        # 获取选股结果
        buylist = check_stocks(context)

        # ---- 卖出逻辑 ----
        # 如果持仓的股票不在买入列表里，就卖出
        if len(context.portfolio.positions) > 0:
            for stock in context.portfolio.positions.keys():
                if not stock in buylist:
                    order_target(stock, 0)

        # ---- 计算买入资金 ----
        # 如果持仓数量不足最大持仓数，就把剩余现金平均分配
        if len(context.portfolio.positions) < g.stocknum:
            num = g.stocknum - len(context.portfolio.positions)
            cash = context.portfolio.cash / num
        else:
            cash = 0

        # ---- 买入逻辑 ----
        # 如果买入列表里有股票，而且当前没有持仓，就买入
        if len(buylist) > 0:
            for stock in buylist:
                if not stock in context.portfolio.positions.keys():
                    order_value(stock, cash)
