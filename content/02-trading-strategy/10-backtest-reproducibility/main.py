def initialize(context):
    # 设置交易标的
    g.security = "000001.XSHE"


def handle_data(context, data):
    # ============================================================
    # 一、简单买卖逻辑
    # ============================================================

    # 如果没有持仓，就买入 1000 股
    if g.security not in context.portfolio.positions:
        order(g.security, 1000)

    # 如果已经有持仓，就卖出 800 股
    else:
        order(g.security, -800)


    # ============================================================
    # 二、输出 portfolio 账户整体信息
    # ============================================================

    print("""多单的仓位：{}""".format(context.portfolio.long_positions))
    print("""空单的仓位：{}""".format(context.portfolio.short_positions))
    print("""总权益：{}""".format(context.portfolio.total_value))
    print("""总权益的累计收益：{}""".format(context.portfolio.returns))
    print("""初始资金：{}""".format(context.portfolio.starting_cash))
    print("""持仓价值：{}""".format(context.portfolio.positions_value))


    # ============================================================
    # 三、输出 subportfolios[0] 子账户信息
    # ============================================================

    print("""累计出入金：{}""".format(context.subportfolios[0].inout_cash))
    print("""可用资金：{}""".format(context.subportfolios[0].available_cash))
    print("""可取资金：{}""".format(context.subportfolios[0].transferable_cash))
    print("""挂单锁住资金：{}""".format(context.subportfolios[0].locked_cash))
    print("""账户所属类型：{}""".format(context.subportfolios[0].type))
