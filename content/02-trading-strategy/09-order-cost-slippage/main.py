def initialize(context):
    # 设定业绩基准为"沪深300"
    set_benchmark('000300.XSHG')
    g.security = '000001.XSHE'
    run_daily(market_open, time='9:30')
    run_daily(after_market_close, time='15:30')


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
    # 得到所有的成交记录
    trades = get_trades()

    for _trade in trades.values():
        print("""成交记录：{}""".format(_trade))
        print("""成交时间：{}""".format(_trade.time))
        print("""对应的订单id：{}""".format(_trade.order_id))
