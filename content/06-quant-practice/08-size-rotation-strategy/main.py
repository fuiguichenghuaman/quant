"""
小盘轮动量化交易策略
"""

# 导入函数库
from jqdata import *
from datetime import datetime, timedelta
import math
import pandas as pd
import statsmodels.api as sm
import numpy as np


# 定基础参数
strBig = '000300.XSHG'
strSmall = '399006.XSHE'
strMarket = '000047.XSHG'

index = [strBig, strSmall, strMarket]

etfBig = '510300.XSHG'
etfSmall = '159915.XSHE'


# 初始化函数
def initialize(context):
    # 设置基准
    set_benchmark('000300.XSHG')

    # 开启动态复权模式
    set_option('use_real_price', True)

    # 输出日志
    log.info('运行初始化函数')

    """
    股票交易手续费：
    买入时佣金万分之三
    卖出时佣金万分之三加千分之一印花税
    每笔交易最低5元
    """
    set_order_cost(
        OrderCost(
            close_tax=0.001,
            open_commission=0.0003,
            close_commission=0.0003,
            min_commission=5
        ),
        type='stock'
    )

    # 初始持仓比例记录
    g.result = {
        etfBig: 0,
        etfSmall: 0
    }

    # 每月第一个交易日开盘运行
    run_monthly(market_open, monthday=1, time='open')


# 计算交易信号
def get_signal(tradeDate):
    start_date = datetime.strptime(tradeDate, '%Y-%m-%d') - timedelta(days=1000)
    start_date = start_date.strftime('%Y-%m-%d')

    # 获取数据
    data = get_price(
        index,
        start_date=start_date,
        end_date=tradeDate,
        frequency='daily',
        fields='close',
        fq='pre'
    )['close']

    data = data / data.shift(250)
    data.dropna(inplace=True)

    # 计算 RS 指标
    for c in data.columns:
        if c != strMarket:
            data[c] = data[c] - data[strMarket] + 1

    data = data.drop(strMarket, 1)

    for c in data.columns:
        data[c] = data[c].apply(lambda x: math.log(x, 10))

    # 计算 RS 的 HP 滤波
    diff = data[strBig] - data[strSmall]
    cycle, trend = sm.tsa.filters.hpfilter(diff, lamb=10000)

    # 计算前 20 个数据的一阶及二阶导数
    t1 = []

    for pos in range(-20, 0):
        X = list(np.arange(20))
        X = sm.add_constant(X)

        est = sm.OLS(trend.iloc[pos - 20:pos], X)
        est = est.fit()

        # 一阶导数
        t1.append(est.params['x1'])

    X = list(np.arange(20))
    X = sm.add_constant(X)

    est1 = sm.OLS(t1, X)
    est1 = est1.fit()

    # 二阶导数
    t2 = est1.params[1]

    result = {}

    # 通过四象限结果计算持仓比例
    if t1[-1] > 0 and t2 > 0:
        result[etfBig] = 1
        result[etfSmall] = 0

    if t1[-1] > 0 and t2 < 0:
        result[etfBig] = 0.5
        result[etfSmall] = 0.5

    if t1[-1] < 0 and t2 > 0:
        result[etfBig] = 0.5
        result[etfSmall] = 0.5

    if t1[-1] < 0 and t2 < 0:
        result[etfBig] = 0
        result[etfSmall] = 1

    return result


# 交易函数，开盘时运行
def market_open(context):
    result = get_signal(context.previous_date.strftime('%Y-%m-%d'))

    # 当前持仓与计算出的持仓比例不一致时，交易调仓
    if not (
        g.result[etfBig] == result[etfBig]
        and g.result[etfSmall] == result[etfSmall]
    ):
        # 先清仓
        order_target_value(etfBig, 0)
        order_target_value(etfSmall, 0)

        # 根据现金买入指定比例 ETF
        cash = context.portfolio.available_cash

        order_target_value(etfBig, result[etfBig] * cash)
        order_target_value(etfSmall, result[etfSmall] * cash)

        # 更新当前持仓比例记录
        g.result = result