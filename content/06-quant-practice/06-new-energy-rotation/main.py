# 导入函数库
import jqdata


# 初始化函数
def initialize(context):
    # 设定沪深300作为基准
    set_benchmark('000300.XSHG')

    # 开启动态复权，使用真实价格
    set_option('use_real_price', True)

    # 设定成交比例
    set_option('order_volume_ratio', 1)

    """
    设定交易费用：
    买入时佣金万分之三
    卖出时佣金万分之三加千分之一印花税
    每笔交易最低5元
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

    # 运行函数，按周运行
    run_weekly(check_stocks, weekday=1, time='before_open')

    # 交易
    run_weekly(trade, weekday=1, time='open')


# 选股函数
def check_stocks(context):
    # 得到某指数的成分股
    g.stocks = get_index_stocks('399808.XSHE')

    # 查询股票市净率，并按照市净率升序排列
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

        # 筛选最低市净率的一只股票
        g.code = g.df['code'][0]


# 交易函数
def trade(context):
    if len(g.stocks) > 0:
        code = g.code

        # 若持仓股票不是最低市净率的股票，则卖出
        for stock in context.portfolio.positions.keys():
            if stock != code:
                order_target(stock, 0)

        # 如果当前已经有持仓，则不再买入
        if len(context.portfolio.positions) > 0:
            return

        # 如果当前没有持仓，则用全部现金买入最低市净率股票
        else:
            order_value(code, context.portfolio.cash)