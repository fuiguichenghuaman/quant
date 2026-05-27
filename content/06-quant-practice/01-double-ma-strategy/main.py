"""
双均线策略
金叉时买入，死叉时卖出
"""

def initialize(context):
    # 设置交易标的
    g.security = "000333.XSHE"

    # 短期均线周期
    g.short_count = 5

    # 长期均线周期
    g.long_count = 10

    # 数据周期：1d 表示日线
    g.unit = "1d"

    # 每个 bar 运行一次 market_open 函数
    run_daily(market_open, time="every_bar")


def market_open(context):
    # 获取 5 日均线
    short_ma = get_ma(g.security, g.short_count, g.unit)

    # 获取 10 日均线
    long_ma = get_ma(g.security, g.long_count, g.unit)

    # 金叉时买入
    if get_golden_signal(short_ma, long_ma):
        print(f"金叉买入，MA{g.short_count}={short_ma}，MA{g.long_count}={long_ma}")
        order_target(g.security, 100)

    # 死叉时卖出
    elif get_death_signal(short_ma, long_ma):
        print(f"卖出所有股票，MA{g.short_count}={short_ma}，MA{g.long_count}={long_ma}")
        order_target(g.security, 0)


# 计算 MA
def get_ma(security: str, count: int, unit: str) -> list:
    # 获取 count + 1 天的收盘价
    df = attribute_history(security, count + 1, unit, ["close"])

    # 计算当前的 MA
    now_ma = df[:count + 1]["close"].rolling(count).mean()[-1]

    # 计算上一次的 MA
    pre_ma = df[:count]["close"].rolling(count).mean()[-1]

    return [pre_ma, now_ma]


"""
判断是否金叉
金叉：True
"""
def get_golden_signal(
        short_ma: list,
        long_ma: list
) -> bool:
    return short_ma[0] < long_ma[0] and short_ma[1] >= long_ma[1]


"""
判断是否死叉
死叉：True
"""
def get_death_signal(
        short_ma: list,
        long_ma: list
) -> bool:
    return short_ma[0] > long_ma[0] and short_ma[1] <= long_ma[1]