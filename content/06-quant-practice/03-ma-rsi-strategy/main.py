"""
MA-RSI量化交易策略

改良点：
原版策略是“按照股票池原始顺序，遇到前10只满足条件的股票就买入”。
这样会严重依赖 get_all_stock 返回的股票顺序。

现在改成：
1. 先找出所有满足条件的股票；
2. 按 RSI10 从低到高排序；
3. 选择 RSI10 最低的前 10 只股票买入。
"""

from jqdata import *
from jqlib.technical_analysis import *
import numpy as np
import pandas as pd


# 初始化函数，设定要操作的股票、基准等
def initialize(context):
    # 设定沪深300作为基准
    set_benchmark('000300.XSHG')

    # 避免未来函数
    set_option('avoid_future_data', True)

    # 开启动态复权，使用真实价格
    set_option('use_real_price', True)

    # 设定成交比例
    set_option('order_volume_ratio', 1)

    """
    设定交易费：
    买入佣金 万分之三，
    卖出佣金 万分之三加千分之一印花税，
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

    # 持仓数量
    g.stocknum = 10

    # 持仓天数
    g.hold_cnt = 0

    # 每天 14:50 运行交易函数
    run_daily(
        trade,
        time='14:50',
        reference_security='000300.XSHG'
    )


# 选股
def check_stocks(context):
    # 获取当天时间
    now = context.current_dt

    # 获取目标股票
    security_list = get_all_stock(context, now, 200)

    log.info('过滤后股票池数量：' + str(len(security_list)))

    # 如果股票池为空，直接返回空列表
    if len(security_list) == 0:
        log.info('过滤后股票池为空')
        return []

    # 获取现价
    h = get_bars(
        security_list,
        count=1,
        unit='1d',
        end_dt=now,
        fields=['close'],
        include_now=True
    )

    # 获取 MA200
    MA200 = MA(
        security_list,
        check_date=now,
        timeperiod=200,
        unit='1d',
        include_now=True
    )

    # 获取 RSI10
    RSI10 = RSI(
        security_list,
        check_date=now,
        N1=10
    )

    # ============================================================
    # 核心改动：
    # 不再遇到前10只符合条件的股票就停止。
    # 而是先把所有符合条件的股票都加入 candidate_list。
    # ============================================================

    candidate_list = []

    for security in security_list:
        # 当前收盘价
        close_price = h[security]['close']

        # 当前 MA200
        ma200_value = MA200[security]

        # 当前 RSI10
        rsi10_value = RSI10[security]

        # 条件1：收盘价高于 MA200
        MA_True = close_price > ma200_value

        # 条件2：RSI10 小于 25
        RSI_True = rsi10_value < 25

        # 如果同时满足两个条件，先加入候选池
        if MA_True and RSI_True:
            candidate_list.append({
                'code': security,
                'close': close_price,
                'ma200': ma200_value,
                'rsi10': rsi10_value
            })

    # 如果没有任何股票满足条件，返回空列表
    if len(candidate_list) == 0:
        log.info('今日没有符合 MA200 和 RSI10 条件的股票')
        return []

    # 转换成 DataFrame，方便排序
    candidate_df = pd.DataFrame(candidate_list)

    # 按 RSI10 从低到高排序
    # RSI10 越低，说明越接近超卖状态
    # code 作为第二排序条件，保证 RSI 相同时排序稳定
    candidate_df = candidate_df.sort_values(
        by=['rsi10', 'code'],
        ascending=[True, True]
    )

    # 选择 RSI10 最低的前 g.stocknum 只股票
    g.buylist = list(candidate_df['code'].head(g.stocknum))

    log.info('满足条件的股票总数：' + str(len(candidate_df)))
    log.info('满足条件股票前20只：')
    log.info(candidate_df.head(20).to_string(index=False))
    log.info('最终买入股票池：' + str(g.buylist))

    return g.buylist


# 获取目标股票，过滤 st、科创板、创业板、退市、次新股
def get_all_stock(context, now, days):
    df = get_all_securities(types=['stock'], date=now)

    df = df[
        (~df['display_name'].str.contains('ST')) &
        (~df['display_name'].str.contains('退')) &
        (~df['display_name'].str.contains('\*')) &
        (df.index.str[0:3] != '300') &
        (df.index.str[0:3] != '688')
    ]

    # 判断上市天数是否满足要求
    return [
        str(stock)
        for stock in df.index
        if (now.date() - df.loc[stock, 'start_date']).days > days
    ]


# 交易
def trade(context):
    log.info('天数：' + str(g.hold_cnt))

    # 获取当天时间
    now = context.current_dt

    # 获取持仓股票
    holding_list = list(context.portfolio.positions.keys())

    # 获取持仓股票现价
    h = get_bars(
        holding_list,
        count=1,
        unit='1d',
        end_dt=now,
        fields=['close'],
        include_now=True
    )

    # 搜索策略交易
    # 没有持仓，买入目标股票
    if len(holding_list) == 0:
        buy_list = check_stocks(context)

        if len(buy_list) == 0:
            log.info('今日没有符合条件的买入股票')
            return

        for security in buy_list:
            cash = context.portfolio.cash / len(buy_list)
            order_value(security, cash)
            g.hold_cnt = 1
            log.info('买入股票：' + str(security))

    # 根据卖出策略卖出，持仓超过11天、RSI > 40、下跌超过 -5%
    elif g.hold_cnt > 0 and g.hold_cnt < 11:
        g.hold_cnt += 1

        RSI10 = RSI(
            holding_list,
            check_date=now,
            N1=10
        )

        for security in holding_list:
            current_price = h[security]['close']
            cost = context.portfolio.positions[security].avg_cost

            if RSI10[security] > 40 or current_price < 0.95 * cost:
                order_target_value(security, 0)
                log.info('卖出股票：' + str(security))
            else:
                break

    # 持仓时间超过11天，卖出持仓股票，然后重新选股买入
    elif g.hold_cnt == 11:
        buy_list = check_stocks(context)

        for security in holding_list:
            order_target_value(security, 0)
            log.info('卖出股票：' + str(security))
            g.hold_cnt = 0

        if len(buy_list) == 0:
            log.info('重新选股后没有符合条件的股票')
            return

        for security in buy_list:
            cash = context.portfolio.cash / len(buy_list)
            order_value(security, cash)
            g.hold_cnt = 1
            log.info('买入股票：' + str(security))

    else:
        log.info('出错啦！')