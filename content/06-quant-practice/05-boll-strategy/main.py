# BOLL量化交易策略
# 导入函数库

from jqdata import *
from jqlib.technical_analysis import *


# 设置初始化函数
def initialize(context):
    # 设定沪深300作为基准
    set_benchmark('000300.XSHG')

    # 开启动态复权模式，真实价格
    set_option('use_real_price', True)

    """
    设定股票交易费用
    买入时佣金万分之三
    卖出时佣金万分之三加千分之一手续费
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

    # 设置交易股票
    g.security = '002389.XSHE'

    # 设置 N 值
    g.k = 2


# 每个交易单位运行
def handle_data(context, data):
    # 获取该股票最近20日的收盘价
    sr = attribute_history(g.security, 20)['close']

    # 获取该股票最近20日均值
    ma = sr.mean()

    # up线：20日均线 + N * SD（20日收盘价标准差）
    up = ma + g.k * sr.std()

    # down线：20日均线 - N * SD（20日收盘价标准差）
    down = ma - g.k * sr.std()

    # 获取股票的开盘价格
    p = get_current_data()[g.security].day_open

    # 获取当前现金
    cash = context.portfolio.available_cash

    # 开盘价格突破下轨，并且没有持仓，则全仓买入
    if p < down and g.security not in context.portfolio.positions:
        order_value(g.security, cash)

    # 开盘价格突破上轨，并且当前有持仓，则全部卖出
    elif p > up and g.security in context.portfolio.positions:
        order_target(g.security, 0)