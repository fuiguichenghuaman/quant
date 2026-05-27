"""
第一部分：整体说明

这个文件是 `8_量化实战_大小盘轮动策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 大小盘轮动策略是怎么实现的

这份脚本主要完成了一件事情：
在大盘股（沪深300 ETF）和小盘股（创业板 ETF）之间做轮动。
根据趋势判断，决定买大盘还是小盘。

什么是大小盘轮动？
- 大盘股（沪深300）：大公司，稳定，波动小
- 小盘股（创业板）：小公司，成长性好，波动大
- 不同时期，大盘和小盘的表现不同
- 轮动策略就是"哪个好买哪个"

判断方法（HP 滤波 + 四象限法）：
1. 计算大盘和小盘的相对强弱（RS）
2. 用 HP 滤波提取趋势
3. 计算趋势的一阶导数（斜率）和二阶导数（加速度）
4. 根据四象限决定持仓比例

四象限：
- 一阶导数 > 0 且二阶导数 > 0：趋势向上且加速 → 全仓大盘
- 一阶导数 > 0 且二阶导数 < 0：趋势向上但减速 → 各半
- 一阶导数 < 0 且二阶导数 > 0：趋势向下但减速 → 各半
- 一阶导数 < 0 且二阶导数 < 0：趋势向下且加速 → 全仓小盘

输入数据是什么：
- 这份代码运行在聚宽平台上
- 聚宽提供沪深300、创业板指的历史数据

输出结果是什么：
- 在聚宽回测引擎里模拟轮动交易
- 通过 log.info() 输出初始化信息

代码运行的大致流程是什么：
1. initialize() 设置基准、交易费用、定时函数
2. get_signal() 计算交易信号（四象限判断）
3. market_open() 每月第一个交易日调仓

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 这是一个比较高级的策略，用到了统计学（HP 滤波、OLS 回归）
- 学会了这个，你就知道量化基金是怎么做大类资产轮动的了

第二部分：代码运行流程

1. `def initialize(context):`
   初始化函数，设置基准、交易费用、定时函数

2. `run_monthly(market_open, monthday=1, time='open')`
   每月第一个交易日开盘时运行

3. `def get_signal(tradeDate):`
   计算交易信号的函数

4. `data = get_price(index, ...)`
   获取大盘和小盘的历史数据

5. `data = data / data.shift(250)`
   计算年化收益率

6. `data[c] = data[c] - data[strMarket] + 1`
   计算相对强弱（RS）

7. `data[c] = data[c].apply(lambda x: math.log(x, 10))`
   取对数

8. `cycle, trend = sm.tsa.filters.hpfilter(diff, lamb=10000)`
   HP 滤波提取趋势

9. 计算一阶导数和二阶导数
10. 根据四象限决定持仓比例

11. `def market_open(context):`
    交易函数，根据信号调仓

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
- `def get_signal(tradeDate):` — 信号计算函数名
- `def market_open(context):` — 交易函数名
- `run_monthly()` — 聚宽的每月定时运行 API
- `get_price()` — 聚宽获取行情数据的 API
- `order_target_value()` — 聚宽的按目标金额下单 API
- `sm.tsa.filters.hpfilter()` — HP 滤波函数
- `sm.OLS()` — OLS 回归函数

可以根据需求修改的参数：
- `strBig = '000300.XSHG'` — 大盘指数代码
- `strSmall = '399006.XSHE'` — 小盘指数代码
- `etfBig = '510300.XSHG'` — 大盘 ETF 代码
- `etfSmall = '159915.XSHE'` — 小盘 ETF 代码
- `lamb=10000` — HP 滤波的平滑参数
- `range(-20, 0)` — 计算导数的窗口大小

第六部分：容易出错的地方

1. `get_price()` 返回的是 DataFrame
   要用 `['close']` 才能拿到收盘价

2. `data / data.shift(250)` 是年化收益率的近似计算
   250 是一年的交易日数

3. `sm.tsa.filters.hpfilter()` 返回两个值
   cycle 是周期成分，trend 是趋势成分

4. `sm.OLS()` 是普通最小二乘回归
   需要用 `sm.add_constant()` 添加常数项

5. `est.params['x1']` 是回归系数（斜率）
   斜率 > 0 表示趋势向上，< 0 表示趋势向下

6. `t2 = est1.params[1]` 是二阶导数
   二阶导数 > 0 表示趋势在加速，< 0 表示趋势在减速

第七部分：用生活化例子解释核心逻辑

想象你在开车：
- 一阶导数（斜率）就是"速度"
  - 斜率 > 0 → 车在加速（趋势向上）
  - 斜率 < 0 → 车在减速（趋势向下）

- 二阶导数（加速度）就是"踩油门的力度"
  - 二阶导数 > 0 → 踩油门更用力（趋势在加速）
  - 二阶导数 < 0 → 松油门了（趋势在减速）

四象限就是：
1. 速度 > 0，加速度 > 0 → 车在加速前进 → 全仓大盘
2. 速度 > 0，加速度 < 0 → 车还在前进但开始减速 → 各半
3. 速度 < 0，加速度 > 0 → 车在后退但开始减速 → 各半
4. 速度 < 0，加速度 < 0 → 车在加速后退 → 全仓小盘

为什么用 HP 滤波？
因为原始数据太"粗糙"了，有很多噪音。
HP 滤波就像一个"平滑器"，把噪音去掉，只留下趋势。

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 什么是大小盘轮动策略
- 什么是 HP 滤波
- 什么是 OLS 回归
- 如何用一阶导数和二阶导数判断趋势
- 什么是四象限法
- 如何用 ETF 做大类资产轮动

这是一个比较高级的策略，涉及到统计学知识。
如果你现在还看不懂 HP 滤波和 OLS 回归，没关系，
先把前面的策略学扎实了，再来挑战这个。

接下来你可以：
- 改一下 HP 滤波的 lambda 参数，看看趋势线的变化
- 改一下导数计算的窗口大小（20），看看信号的变化
- 在聚宽平台上运行回测，看看大小盘轮动策略的收益曲线
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
大小盘轮动策略 —— 讲解版

在大盘股（沪深300 ETF）和小盘股（创业板 ETF）之间做轮动。
根据趋势判断，决定买大盘还是小盘。
"""

# ---- 导入库 ----
from jqdata import *
from datetime import datetime, timedelta
import math
import pandas as pd
import statsmodels.api as sm
import numpy as np


# ---- 定义基础参数 ----
# 大盘指数：沪深300
strBig = '000300.XSHG'
# 小盘指数：创业板指
strSmall = '399006.XSHE'
# 市场指数：上证50（用来计算相对强弱）
strMarket = '000047.XSHG'

# 三个指数的列表
index = [strBig, strSmall, strMarket]

# 大盘 ETF：沪深300 ETF
etfBig = '510300.XSHG'
# 小盘 ETF：创业板 ETF
etfSmall = '159915.XSHE'


# ---- 初始化函数 ----
def initialize(context):
    # ---- 设置基准 ----
    set_benchmark('000300.XSHG')

    # ---- 开启动态复权 ----
    set_option('use_real_price', True)

    log.info('运行初始化函数')

    # ---- 设置交易费用 ----
    set_order_cost(
        OrderCost(
            close_tax=0.001,
            open_commission=0.0003,
            close_commission=0.0003,
            min_commission=5
        ),
        type='stock'
    )

    # ---- 初始持仓比例记录 ----
    # 记录当前大盘和小盘的持仓比例
    g.result = {
        etfBig: 0,
        etfSmall: 0
    }

    # ---- 设置定时运行 ----
    # 每月第一个交易日开盘时运行
    run_monthly(market_open, monthday=1, time='open')


# ---- 计算交易信号 ----
# 这个函数是策略的核心，用 HP 滤波和四象限法计算持仓比例
def get_signal(tradeDate):
    # ---- 获取历史数据 ----
    # 计算起始日期：当前日期往前推 1000 天
    start_date = datetime.strptime(tradeDate, '%Y-%m-%d') - timedelta(days=1000)
    start_date = start_date.strftime('%Y-%m-%d')

    # 获取三个指数的收盘价
    data = get_price(
        index,
        start_date=start_date,
        end_date=tradeDate,
        frequency='daily',
        fields='close',
        fq='pre'
    )['close']

    # ---- 计算年化收益率 ----
    # data.shift(250) 是 250 天前的数据
    # data / data.shift(250) 是当前价格 / 250 天前的价格
    # 这个比值可以近似理解为"年化收益率"
    data = data / data.shift(250)

    # 去掉空值（前 250 天没有数据）
    data.dropna(inplace=True)

    # ---- 计算相对强弱（RS） ----
    # 用大盘和小盘分别减去市场指数
    # +1 是为了保证对数计算有意义
    for c in data.columns:
        if c != strMarket:
            data[c] = data[c] - data[strMarket] + 1

    # 去掉市场指数列
    data = data.drop(strMarket, 1)

    # ---- 取对数 ----
    # 对数可以把"乘法关系"变成"加法关系"
    # 方便后面的分析
    for c in data.columns:
        data[c] = data[c].apply(lambda x: math.log(x, 10))

    # ---- HP 滤波 ----
    # HP 滤波把数据分成两部分：
    # cycle: 周期成分（短期波动）
    # trend: 趋势成分（长期趋势）
    # lamb=10000 是平滑参数，越大越平滑
    diff = data[strBig] - data[strSmall]
    cycle, trend = sm.tsa.filters.hpfilter(diff, lamb=10000)

    # ---- 计算一阶导数和二阶导数 ----
    # 一阶导数（斜率）：趋势是向上还是向下
    # 二阶导数（加速度）：趋势是在加速还是减速
    t1 = []

    # 用 OLS 回归计算斜率
    for pos in range(-20, 0):
        X = list(np.arange(20))
        X = sm.add_constant(X)

        est = sm.OLS(trend.iloc[pos - 20:pos], X)
        est = est.fit()

        # 一阶导数（斜率）
        t1.append(est.params['x1'])

    # 用 OLS 回归计算斜率的变化率（二阶导数）
    X = list(np.arange(20))
    X = sm.add_constant(X)

    est1 = sm.OLS(t1, X)
    est1 = est1.fit()

    # 二阶导数
    t2 = est1.params[1]

    result = {}

    # ---- 四象限判断 ----
    # 根据一阶导数和二阶导数的正负，决定持仓比例
    if t1[-1] > 0 and t2 > 0:
        # 趋势向上且加速 → 全仓大盘
        result[etfBig] = 1
        result[etfSmall] = 0

    if t1[-1] > 0 and t2 < 0:
        # 趋势向上但减速 → 各半
        result[etfBig] = 0.5
        result[etfSmall] = 0.5

    if t1[-1] < 0 and t2 > 0:
        # 趋势向下但减速 → 各半
        result[etfBig] = 0.5
        result[etfSmall] = 0.5

    if t1[-1] < 0 and t2 < 0:
        # 趋势向下且加速 → 全仓小盘
        result[etfBig] = 0
        result[etfSmall] = 1

    return result


# ---- 交易函数 ----
# 每月第一个交易日开盘时运行
def market_open(context):
    # 获取交易信号
    result = get_signal(context.previous_date.strftime('%Y-%m-%d'))

    # ---- 检查是否需要调仓 ----
    # 如果当前持仓比例和计算出的比例不一致，就调仓
    if not (
        g.result[etfBig] == result[etfBig]
        and g.result[etfSmall] == result[etfSmall]
    ):
        # ---- 先清仓 ----
        order_target_value(etfBig, 0)
        order_target_value(etfSmall, 0)

        # ---- 根据新比例买入 ----
        cash = context.portfolio.available_cash

        order_target_value(etfBig, result[etfBig] * cash)
        order_target_value(etfSmall, result[etfSmall] * cash)

        # 更新持仓比例记录
        g.result = result
