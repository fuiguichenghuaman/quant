"""
市净率小于1
负债比例低于市场平均值
企业的流动资产至少是流动负债的1.2倍
每月调一次仓
加入止损：十天沪深300跌幅达10%清仓
"""

import jqdata


# 设定初始化函数
def initialize(context):
    # 设定基准
    set_benchmark('000300.XSHG')

    # 设定指数
    g.stockindex = '000300.XSHG'

    # 开启真实价格交易
    set_option('use_real_price', True)

    # 设定成交比例
    set_option('order_volume_ratio', 1)

    """
    设定股票交易佣金
    买入时佣金万分之三
    卖出时佣金万分之三加千分之一印花税
    每笔交易最低手续费5元
    """
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

    # 最大持仓数量
    g.stocknum = 5

    # 自动设定调仓月份
    f = 12
    g.transfer_date = list(range(1, 13, 12 // f))

    # 根据大盘止损
    run_daily(broader_stoploss, time='open')

    # 每月调仓程序
    run_monthly(trade, monthday=20, time='open')


# 选股函数
def check_stocks(context):
    # 获取沪深300成分股
    security = get_index_stocks(g.stockindex)

    # 按条件查询股票
    stocks = get_fundamentals(
        query(
            valuation.code,
            valuation.pb_ratio,
            balance.total_assets,
            balance.total_liability,
            balance.total_current_assets,
            balance.total_current_liability
        ).filter(
            valuation.code.in_(security),

            # 市净率小于1
            valuation.pb_ratio < 1,

            # 企业的流动资产至少是流动负债的1.2倍
            balance.total_current_assets / balance.total_current_liability > 1.2
        )
    )

    # 计算股票的负债比例
    stocks['debt_asset'] = stocks['total_liability'] / stocks['total_assets']

    # 计算负债比例的市场均值
    median = stocks['debt_asset'].median()

    # 筛选负债比例低于市场均值的股票列表
    codes = stocks[stocks['debt_asset'] < median].code

    return list(codes)


# 根据大盘止损
def broader_stoploss(context):
    stoploss = bm_stoploss(kernel=2, n=3, threshold=0.1)

    if stoploss:
        if len(context.portfolio.positions) > 0:
            for stock in list(context.portfolio.positions.keys()):
                order_target(stock, 0)


# 大盘止损函数
def bm_stoploss(kernel=2, n=10, threshold=0.03):
    """
    方法1：当天 n 日均线与昨日收盘价构成“死叉”，则为 True
    方法2：当天 n 日内跌幅超过阈值，则为 True
    """

    # 止损方法1
    if kernel == 1:
        t = n + 2

        hist = attribute_history(
            '000300.XSHG',
            t,
            '1d',
            'close',
            df=False
        )

        temp1 = sum(hist['close'][1:-1]) / float(n)
        temp2 = sum(hist['close'][0:-2]) / float(n)

        close1 = hist['close'][-1]
        close2 = hist['close'][-2]

        if (close2 > temp2) and (close1 < temp1):
            return True
        else:
            return False

    # 止损方法2
    elif kernel == 2:
        hist1 = attribute_history(
            '000300.XSHG',
            n,
            '1d',
            'close',
            df=False
        )

        if (1 - float(hist1['close'][-1] / hist1['close'][0])) >= threshold:
            return True
        else:
            return False


# 交易函数
def trade(context):
    # 获取当前月份
    months = context.current_dt.month

    # 当前月为交易月
    if months in g.transfer_date:
        # 获取股票池
        buylist = check_stocks(context)

        # 卖出逻辑
        if len(context.portfolio.positions) > 0:
            for stock in context.portfolio.positions.keys():
                if not stock in buylist:
                    order_target(stock, 0)

        # 分配买入资金
        if len(context.portfolio.positions) < g.stocknum:
            num = g.stocknum - len(context.portfolio.positions)
            cash = context.portfolio.cash / num
        else:
            cash = 0

        # 买入逻辑
        if len(buylist) > 0:
            for stock in buylist:
                if not stock in context.portfolio.positions.keys():
                    order_value(stock, cash)