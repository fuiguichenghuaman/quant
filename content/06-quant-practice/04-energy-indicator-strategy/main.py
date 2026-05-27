"""
能量型指标量化交易策略
"""

from jqdata import *
from jqlib.technical_analysis import *


# 初始化函数
def initialize(context):
    # 选定交易股票
    g.security = '000001.XSHE'

    # 设定基准
    set_benchmark('000300.XSHG')

    # 开启动态复权，使用真实价格
    set_option('use_real_price', True)

    """
    设定交易费：
    买入佣金 万分之三
    卖出佣金 万分之三加千分之一印花税
    每笔交易最低5元
    """
    set_order_cost(
        OrderCost(
            close_tax=0.001,
            open_commission=0.0003,
            close_commission=0.0003,
            close_today_commission=0,
            min_commission=5
        ),
        type='stock'
    )


# 每个交易单位运行一次
def handle_data(context, data):
    # 获取股票
    security = g.security

    # 计算情绪指标 BRAR
    BR1, AR1 = BRAR(
        security,
        check_date=context.current_dt,
        N=26
    )

    # 计算中间意愿指标 CR
    CR1, MA1, MA2, MA3, MA4 = CR(
        security,
        check_date=context.current_dt,
        N=26,
        M1=10,
        M2=20,
        M3=40,
        M4=62
    )

    # 计算成交量变异指标 VR
    VR1, MAVR1 = VR(
        security,
        check_date=context.current_dt,
        N=26,
        M=6
    )

    # 获取当前现金
    cash = context.portfolio.cash

    # 识别买入信号
    # 条件：AR < 100，BR < 100，BR < AR，CR < 100，VR < 100
    if AR1[security] < 100 and BR1[security] < 100 and BR1[security] < AR1[security] and CR1[security] < 100 and VR1[security] < 100:
        order_value(security, cash)
        log.info("买入股票 %s" % (security))

    # 识别卖出信号
    # 条件：AR > 150，BR > 150，CR > 150，VR > 150，并且当前有可卖持仓
    elif AR1[security] > 150 and BR1[security] > 150 and CR1[security] > 150 and VR1[security] > 150 and context.portfolio.positions[security].closeable_amount > 0:
        order_target(security, 0)
        log.info("卖出股票 %s" % (security))