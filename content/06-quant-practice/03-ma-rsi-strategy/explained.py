"""
第一部分：整体说明

这个文件是 `3_量化实战_MA_RSI策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 量化选股的逻辑是怎么落地的

这份脚本主要完成了一件事情：
用 MA200（200日均线）和 RSI10（10日RSI）两个指标来选股和交易。

选股逻辑：
- 从 A 股里过滤掉 ST、科创板、创业板、退市股、次新股
- 找出收盘价高于 MA200 的股票（趋势向上）
- 找出 RSI10 小于 25 的股票（超卖状态）
- 两个条件同时满足的股票，按 RSI10 从低到高排序
- 选 RSI10 最低的前 10 只买入

卖出逻辑：
- 持仓超过 11 天 → 全部卖出重新选股
- RSI10 大于 40 → 卖出（不再超卖了）
- 亏损超过 5% → 止损卖出

输入数据是什么：
- 这份代码运行在聚宽平台上
- 聚宽提供 A 股历史数据、技术指标函数、财务数据

输出结果是什么：
- 在聚宽回测引擎里模拟选股和买卖
- 通过 log.info() 输出选股过程和交易记录

代码运行的大致流程是什么：
1. initialize() 设置参数和定时函数
2. check_stocks() 选股函数，找出符合条件的股票
3. get_all_stock() 过滤掉不符合条件的股票
4. trade() 交易函数，根据选股结果买卖

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 从"单只股票策略"升级到"多只股票选股策略"
- 学会了这个，你就知道量化基金是怎么选股的了

第二部分：代码运行流程

1. `def initialize(context):`
   初始化函数，设置基准、交易费用、持仓数量、定时函数

2. `run_weekly(check_stocks, weekday=1, time='before_open')`
   每周一开盘前运行选股函数

3. `run_weekly(trade, weekday=1, time='open')`
   每周一开盘时运行交易函数

4. `def check_stocks(context):`
   选股函数：获取全 A 股 → 过滤 → 计算 MA200 和 RSI10 → 筛选 → 排序

5. `def get_all_stock(context, now, days):`
   过滤函数：去掉 ST、科创板、创业板、退市股、次新股

6. `def trade(context):`
   交易函数：没持仓就买入，持仓超 11 天或触发条件就卖出

第三部分：带详细中文注释的代码
第四部分：逐行 / 逐段解释

下面这份代码会在关键地方加很细的中文注释。
注释里不仅解释"这行做什么"，还会解释：
- 为什么要这样写
- 上一段和下一段是什么关系
- 改动这里会有什么影响
- 哪些地方是固定写法
- 哪些地方是参数，可以改

第五部分：固定写法与可修改部分

初学阶段建议不要乱改的固定写法：
- `def initialize(context):` — 聚宽要求的初始化函数名
- `def check_stocks(context):` — 选股函数名
- `def trade(context):` — 交易函数名
- `run_weekly()` — 聚宽的每周定时运行 API
- `get_all_securities()` — 聚宽获取所有股票的 API
- `get_bars()` — 聚宽获取行情数据的 API
- `MA()` — 聚宽的均线计算函数
- `RSI()` — 聚宽的 RSI 指标计算函数
- `order_value()` — 聚宽的按金额下单 API
- `order_target_value()` — 聚宽的按目标金额下单 API

可以根据需求修改的参数：
- `g.stocknum = 10` — 持仓数量，可以改成 5、20 等
- `days=200` — 过滤次新股的天数，200 表示上市超过 200 天
- `timeperiod=200` — MA200 的周期
- `N1=10` — RSI 的周期
- `RSI10 < 25` — RSI 超卖阈值，可以改成 20、30 等
- `RSI10 > 40` — RSI 卖出阈值
- `0.95 * cost` — 止损比例，5% 止损

第六部分：容易出错的地方

1. `get_all_securities()` 返回的是 DataFrame
   要用 `df.index` 才能拿到股票代码列表

2. `get_bars()` 返回的是嵌套字典
   要用 `h[security]['close']` 才能拿到收盘价

3. `MA()` 和 `RSI()` 返回的是字典
   要用 `MA200[security]` 才能拿到具体的值

4. `sort_values()` 的 `ascending=[True, True]` 表示两个字段都升序
   如果改成 `[True, False]`，第二个字段就变成降序

5. `head(g.stocknum)` 取前 N 只股票
   如果满足条件的股票不足 N 只，就全部买入

第七部分：用生活化例子解释核心逻辑

想象你是一个基金经理，要从 3000 只股票里选出 10 只来买：

第一步：先把"垃圾股"过滤掉
- ST 股（连续亏损的）→ 不买
- 科创板、创业板（波动太大）→ 不买
- 刚上市的新股（数据不够）→ 不买

第二步：看趋势
- 收盘价高于 200 日均线 → 说明长期趋势向上 → 留下

第三步：看超卖
- RSI10 小于 25 → 说明最近跌了很多，可能被低估了 → 留下

第四步：排序
- RSI10 越低 → 越"超卖" → 越可能反弹 → 优先买入

这就是量化选股的基本思路：过滤 → 筛选 → 排序 → 买入

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 如何从全 A 股里选股
- 如何用 MA 和 RSI 组合选股
- 如何用 DataFrame 做数据筛选和排序
- 如何设置持仓数量和止损
- 如何用 run_weekly() 设置每周定时运行

接下来你可以：
- 改一下选股条件，比如加上 MACD 或成交量
- 改一下持仓数量，看看 5 只和 20 只的区别
- 改一下 RSI 阈值，看看 20 和 30 的区别
- 在聚宽平台上运行回测，看看不同参数的收益曲线
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
MA-RSI 量化交易策略 —— 讲解版

改良点：
原版策略是"按照股票池原始顺序，遇到前10只满足条件的股票就买入"。
这样会严重依赖 get_all_stock 返回的股票顺序。

现在改成：
1. 先找出所有满足条件的股票；
2. 按 RSI10 从低到高排序；
3. 选择 RSI10 最低的前 10 只股票买入。
"""

# ---- 导入聚宽的库 ----
from jqdata import *
from jqlib.technical_analysis import *
import numpy as np
import pandas as pd


# ---- 初始化函数 ----
def initialize(context):
    # ---- 设置基准 ----
    set_benchmark('000300.XSHG')

    # ---- 避免未来函数 ----
    # 未来函数就是"用到了未来的数据"，这在回测中是大忌
    # 设置为 True 可以防止不小心用到未来数据
    set_option('avoid_future_data', True)

    # ---- 开启动态复权 ----
    set_option('use_real_price', True)

    # ---- 设置成交比例 ----
    # order_volume_ratio=1 表示每次交易不超过成交量的 100%
    set_option('order_volume_ratio', 1)

    # ---- 设置交易费用 ----
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

    # ---- 设置持仓数量 ----
    # 最多同时持有 10 只股票
    g.stocknum = 10

    # ---- 设置持仓天数计数器 ----
    # 用来记录当前持仓已经持有了多少天
    g.hold_cnt = 0

    # ---- 设置定时运行 ----
    # 每天 14:50 运行交易函数
    # 选择 14:50 是因为快收盘了，数据比较稳定
    run_daily(
        trade,
        time='14:50',
        reference_security='000300.XSHG'
    )


# ---- 选股函数 ----
# 这个函数负责从全 A 股里选出符合条件的股票
def check_stocks(context):
    # 获取当前时间
    now = context.current_dt

    # ---- 第一步：获取过滤后的股票池 ----
    # get_all_stock() 会过滤掉 ST、科创板、创业板、退市股、次新股
    # 200 表示上市至少 200 天
    security_list = get_all_stock(context, now, 200)
    log.info('过滤后股票池数量：' + str(len(security_list)))

    # 如果股票池为空，直接返回
    if len(security_list) == 0:
        log.info('过滤后股票池为空')
        return []

    # ---- 第二步：获取行情数据 ----
    # get_bars() 获取股票的行情数据
    # count=1: 只取 1 天的数据
    # unit='1d': 日线数据
    # fields=['close']: 只要收盘价
    # include_now=True: 包含当天的数据
    h = get_bars(
        security_list,
        count=1,
        unit='1d',
        end_dt=now,
        fields=['close'],
        include_now=True
    )

    # ---- 第三步：获取 MA200 ----
    # MA() 是聚宽的均线计算函数
    # timeperiod=200: 200 日均线
    MA200 = MA(
        security_list,
        check_date=now,
        timeperiod=200,
        unit='1d',
        include_now=True
    )

    # ---- 第四步：获取 RSI10 ----
    # RSI() 是聚宽的 RSI 指标计算函数
    # N1=10: 10 日 RSI
    RSI10 = RSI(
        security_list,
        check_date=now,
        N1=10
    )

    # ---- 第五步：筛选符合条件的股票 ----
    # 条件1：收盘价 > MA200（趋势向上）
    # 条件2：RSI10 < 25（超卖状态）
    candidate_list = []

    for security in security_list:
        close_price = h[security]['close']
        ma200_value = MA200[security]
        rsi10_value = RSI10[security]

        # 两个条件同时满足才加入候选池
        MA_True = close_price > ma200_value
        RSI_True = rsi10_value < 25

        if MA_True and RSI_True:
            candidate_list.append({
                'code': security,
                'close': close_price,
                'ma200': ma200_value,
                'rsi10': rsi10_value
            })

    # 如果没有符合条件的股票，返回空列表
    if len(candidate_list) == 0:
        log.info('今日没有符合 MA200 和 RSI10 条件的股票')
        return []

    # ---- 第六步：排序 ----
    # 转换成 DataFrame，方便排序
    candidate_df = pd.DataFrame(candidate_list)

    # 按 RSI10 从低到高排序
    # RSI10 越低，说明越接近超卖状态，反弹的可能性越大
    candidate_df = candidate_df.sort_values(
        by=['rsi10', 'code'],
        ascending=[True, True]
    )

    # ---- 第七步：选出前 N 只 ----
    g.buylist = list(candidate_df['code'].head(g.stocknum))

    log.info('满足条件的股票总数：' + str(len(candidate_df)))
    log.info('满足条件股票前20只：')
    log.info(candidate_df.head(20).to_string(index=False))
    log.info('最终买入股票池：' + str(g.buylist))

    return g.buylist


# ---- 过滤股票的函数 ----
# 这个函数负责过滤掉不符合条件的股票
def get_all_stock(context, now, days):
    # 获取所有 A 股
    df = get_all_securities(types=['stock'], date=now)

    # 过滤掉：
    # 1. ST 股（display_name 包含 "ST"）
    # 2. 退市股（display_name 包含 "退"）
    # 3. *ST 股（display_name 包含 "*"）
    # 4. 创业板（代码以 "300" 开头）
    # 5. 科创板（代码以 "688" 开头）
    df = df[
        (~df['display_name'].str.contains('ST')) &
        (~df['display_name'].str.contains('退')) &
        (~df['display_name'].str.contains('\*')) &
        (df.index.str[0:3] != '300') &
        (df.index.str[0:3] != '688')
    ]

    # 过滤掉次新股（上市天数不足 days 天）
    return [
        str(stock)
        for stock in df.index
        if (now.date() - df.loc[stock, 'start_date']).days > days
    ]


# ---- 交易函数 ----
# 这个函数负责根据选股结果进行买卖
def trade(context):
    log.info('天数：' + str(g.hold_cnt))

    now = context.current_dt

    # 获取当前持仓的股票列表
    holding_list = list(context.portfolio.positions.keys())

    # 获取持仓股票的现价
    h = get_bars(
        holding_list,
        count=1,
        unit='1d',
        end_dt=now,
        fields=['close'],
        include_now=True
    )

    # ---- 情况1：没有持仓 → 选股买入 ----
    if len(holding_list) == 0:
        buy_list = check_stocks(context)

        if len(buy_list) == 0:
            log.info('今日没有符合条件的买入股票')
            return

        # 把现金平均分配给每只股票
        for security in buy_list:
            cash = context.portfolio.cash / len(buy_list)
            order_value(security, cash)
            g.hold_cnt = 1
            log.info('买入股票：' + str(security))

    # ---- 情况2：持仓 1-10 天 → 检查是否需要卖出 ----
    elif g.hold_cnt > 0 and g.hold_cnt < 11:
        g.hold_cnt += 1

        # 获取持仓股票的 RSI10
        RSI10 = RSI(
            holding_list,
            check_date=now,
            N1=10
        )

        for security in holding_list:
            current_price = h[security]['close']
            cost = context.portfolio.positions[security].avg_cost

            # 卖出条件：
            # 1. RSI10 > 40（不再超卖了）
            # 2. 亏损超过 5%（止损）
            if RSI10[security] > 40 or current_price < 0.95 * cost:
                order_target_value(security, 0)
                log.info('卖出股票：' + str(security))
            else:
                break

    # ---- 情况3：持仓超过 11 天 → 全部卖出重新选股 ----
    elif g.hold_cnt == 11:
        buy_list = check_stocks(context)

        # 卖出所有持仓
        for security in holding_list:
            order_target_value(security, 0)
            log.info('卖出股票：' + str(security))
            g.hold_cnt = 0

        # 如果有新的买入目标，就买入
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
