def initialize(context):
    g.security = '000001.XSHE'
    set_benchmark('000300.XSHG')
    run_daily(market_open, time='9:30')
    set_order_cost(OrderCost(open_commission=0.03, close_commission=0.03, close_today_commission=0.001, min_commission=5), type='stock')
    set_slippage(PriceRelatedSlippage(0.002),type='stock')
    set_option('order_volume_ratio',0.5)
    set_option('use_real_price',True)




def market_open(context):
    if g.security not in context.portfolio.positions:
        order(g.security,1000)
    else:
        order(g.security,-800)
        #第一次卖出800，剩下200，所以还要再卖一次800，会自动下单检查标的数量，所以是买入1000花费一天时间
        #卖出800两次，需要两天才能清仓
        #一共是三天一个周期
