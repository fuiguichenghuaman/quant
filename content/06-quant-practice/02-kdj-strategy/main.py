"""
量化交易策略

买超买技术指标 KDJ

以 K 在 20 左右向上交叉 D 时，全仓买入；
以 K 在 80 左右向下交叉 D 时，全仓卖出。
"""

import jqdata
from jqlib.technical_analysis import *


def initialize(context):
    # 设定基准：沪深300
    set_benchmark('000300.XSHG')

    # 开启动态复权模式
    set_option('use_real_price', True)

    # 设置股票交易成本
    # 买入佣金万分之三，卖出佣金万分之三，卖出印花税千分之一，最低佣金5元
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

    # 开盘前运行
    run_daily(
        before_market_open,
        time='before_open',
        reference_security='000300.XSHG'
    )

    # 开盘时运行
    run_daily(
        market_open,
        time='open',
        reference_security='000300.XSHG'
    )

    # 收盘后运行
    run_daily(
        after_market_close,
        time='after_close',
        reference_security='000300.XSHG'
    )


def before_market_open(context):
    # 开盘前运行函数
    # 输出运行时间
    log.info("""before_market_open运行时间：{}""".format(str(context.current_dt.time())))

    # 设置交易股票
    g.security = '000001.XSHE'


def market_open(context):
    # 开盘时运行函数
    # 输出运行时间
    log.info("""market_open运行时间：{}""".format(str(context.current_dt.time())))

    security = g.security

    # 调用 KD 函数，获取该股票当前日期的 K 值和 D 值
    K1, D1 = KD(
        security,
        check_date=context.current_dt,
        N=9,
        M1=3,
        M2=3
    )

    # 获取当前账户可用现金
    cash = context.portfolio.available_cash

    # 识别买入信号：K 在 20 左右向上穿 D 时，全仓买入
    if K1[security] >= 20 and K1[security] > D1[security]:
        # 买入日志
        log.info("""买入股票{}""".format(security))

        # 全仓买入
        order_value(security, cash)

    # 识别卖出信号：K 在 80 左右向下穿 D，并且当前有可卖持仓时，全部卖出
    elif K1[security] < 80 and K1[security] < D1[security] and context.portfolio.positions[security].closeable_amount > 0:
        # 卖出日志
        log.info("""卖出股票{}""".format(security))

        # 全仓卖出
        order_target(security, 0)


def after_market_close(context):
    # 收盘后运行函数
    # 输出运行时间
    log.info("""after_market_close：{}""".format(str(context.current_dt.time())))

    # 得到当天所有成交记录
    trades = get_trades()

    for _trade in trades.values():
        log.info("""成交记录：{}""".format(str(_trade)))

    log.info("""当天交易结束""")