"""
第一部分：整体说明

这个文件是 `5_量化实战_Boll布林带策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 布林带（Bollinger Bands）在量化交易中怎么用

这份脚本主要完成了一件事情：
用布林带（BOLL）指标来判断一只股票的买卖时机。

什么是布林带？
布林带由三条线组成：
- 中轨（MA）：20 日均线
- 上轨（UP）：中轨 + N × 标准差
- 下轨（DOWN）：中轨 - N × 标准差

布林带的核心思想：
- 价格大部分时间在布林带内运行
- 价格突破上轨 → 可能涨过头了 → 卖出
- 价格突破下轨 → 可能跌过头了 → 买入

买入条件：
- 开盘价 < 下轨（价格突破下轨）且没有持仓 → 全仓买入

卖出条件：
- 开盘价 > 上轨（价格突破上轨）且有持仓 → 全仓卖出

输入数据是什么：
- 这份代码运行在聚宽平台上
- 聚宽提供股票的历史数据

输出结果是什么：
- 在聚宽回测引擎里模拟买卖
- 没有打印日志，但聚宽会自动记录交易

代码运行的大致流程是什么：
1. initialize() 设置股票、N 值、交易费用
2. handle_data() 每个交易日运行，计算布林带，判断买卖

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 布林带是一个"通道型"指标，和均线、KDJ 不同
- 布林带策略适合震荡市，不适合趋势市

第二部分：代码运行流程

1. `def initialize(context):`
   初始化函数，设置基准、交易费用、股票、N 值

2. `def handle_data(context, data):`
   每个交易日运行的主函数

3. `sr = attribute_history(g.security, 20)['close']`
   获取最近 20 天的收盘价

4. `ma = sr.mean()`
   计算 20 日均线（中轨）

5. `up = ma + g.k * sr.std()`
   计算上轨：中轨 + 2 × 标准差

6. `down = ma - g.k * sr.std()`
   计算下轨：中轨 - 2 × 标准差

7. `p = get_current_data()[g.security].day_open`
   获取当天的开盘价

8. `if p < down and not in positions:`
   开盘价低于下轨且没有持仓 → 买入

9. `elif p > up and in positions:`
   开盘价高于上轨且有持仓 → 卖出

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
- `def handle_data(context, data):` — 聚宽要求的每 bar 运行函数名
- `attribute_history()` — 聚宽获取历史数据的 API
- `get_current_data()` — 聚宽获取当前数据的 API
- `set_order_cost()` — 聚宽的交易费用设置 API
- `order_value()` — 聚宽的按金额下单 API
- `order_target()` — 聚宽的按目标持仓下单 API

可以根据需求修改的参数：
- `g.security = '002389.XSHE'` — 可以改成别的股票代码
- `g.k = 2` — 布林带的宽度系数，2 是最常用的值
  - 改成 1：布林带更窄，信号更多但假信号也更多
  - 改成 3：布林带更宽，信号更少但更可靠
- `attribute_history(g.security, 20)` 里的 20 — 布林带的周期

第六部分：容易出错的地方

1. `sr.mean()` 是 Pandas 的均值函数
   不是 NumPy 的 `np.mean()`

2. `sr.std()` 是 Pandas 的标准差函数
   默认是样本标准差（除以 n-1），不是总体标准差（除以 n）

3. `get_current_data()[g.security].day_open` 获取的是当天开盘价
   不是收盘价，也不是前一天的收盘价

4. `g.security not in context.portfolio.positions` 判断是否没有持仓
   如果有持仓就是 `g.security in context.portfolio.positions`

5. 布林带策略在趋势市里会频繁"假突破"
   比如股票一直涨，布林带上轨也会跟着涨，可能永远触发不了卖出

第七部分：用生活化例子解释核心逻辑

想象布林带是一条"河道"：
- 中轨是河道的中心线
- 上轨是河的右岸
- 下轨是河的左岸
- 股票价格就像一艘船，大部分时间在河道里跑

当船跑到左岸（价格 < 下轨）：
- 说明船偏得太厉害了，可能会弹回中间
- 这时候买入 → 等船弹回中间或右岸时卖出

当船跑到右岸（价格 > 上轨）：
- 说明船偏得太厉害了，可能会弹回中间
- 这时候卖出 → 等船弹回中间或左岸时再买入

为什么用标准差来计算布林带宽度？
因为标准差衡量的是"波动性"：
- 波动大的股票，布林带自动变宽
- 波动小的股票，布林带自动变窄
- 这样布林带能自适应不同波动性的股票

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 什么是布林带（Bollinger Bands）
- 如何用 mean() 和 std() 计算布林带
- 如何用 get_current_data() 获取当天开盘价
- 通道型指标和趋势型指标的区别
- 布林带策略的优缺点

接下来你可以：
- 改一下 g.k 的值，看看布林带宽度的变化
- 改一下周期（20），看看不同周期的效果
- 在聚宽平台上运行回测，对比布林带策略和其他策略的收益
- 试试在布林带中轨附近也设置交易信号
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
BOLL 布林带策略 —— 讲解版

布林带由三条线组成：
- 中轨（MA）：20 日均线
- 上轨（UP）：中轨 + N × 标准差
- 下轨（DOWN）：中轨 - N × 标准差

买入：开盘价 < 下轨 且没有持仓
卖出：开盘价 > 上轨 且有持仓
"""

# ---- 导入聚宽的库 ----
from jqdata import *
from jqlib.technical_analysis import *


# ---- 初始化函数 ----
def initialize(context):
    # ---- 设置基准 ----
    set_benchmark('000300.XSHG')

    # ---- 开启动态复权 ----
    set_option('use_real_price', True)

    # ---- 设置交易费用 ----
    # 买入佣金万分之三
    # 卖出佣金万分之三 + 千分之一印花税
    # 每笔最低 5 元
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

    # ---- 设置交易股票 ----
    # "002389.XSHE" 是航天彩虹
    g.security = '002389.XSHE'

    # ---- 设置 N 值 ----
    # N 是布林带的宽度系数
    # N=2 是最常用的值，表示上下轨在中轨上下各 2 个标准差的位置
    g.k = 2


# ---- 每个交易日运行的主函数 ----
def handle_data(context, data):
    # ---- 获取最近 20 天的收盘价 ----
    # attribute_history() 是聚宽的 API，获取历史数据
    # 参数：股票代码、获取天数
    # ['close'] 只取收盘价这一列
    sr = attribute_history(g.security, 20)['close']

    # ---- 计算中轨（20 日均线） ----
    # mean() 是 Pandas 的均值函数
    ma = sr.mean()

    # ---- 计算上轨 ----
    # 上轨 = 中轨 + N × 标准差
    # std() 是 Pandas 的标准差函数
    up = ma + g.k * sr.std()

    # ---- 计算下轨 ----
    # 下轨 = 中轨 - N × 标准差
    down = ma - g.k * sr.std()

    # ---- 获取当天开盘价 ----
    # get_current_data() 获取当前行情数据
    # [g.security].day_open 获取当天的开盘价
    p = get_current_data()[g.security].day_open

    # ---- 获取当前可用现金 ----
    cash = context.portfolio.available_cash

    # ---- 买入信号 ----
    # 条件1：开盘价 < 下轨（价格突破下轨，可能跌过头了）
    # 条件2：当前没有持仓
    # 两个条件同时满足才买入
    if p < down and g.security not in context.portfolio.positions:
        # 用所有可用现金买入
        order_value(g.security, cash)

    # ---- 卖出信号 ----
    # 条件1：开盘价 > 上轨（价格突破上轨，可能涨过头了）
    # 条件2：当前有持仓
    # 两个条件同时满足才卖出
    elif p > up and g.security in context.portfolio.positions:
        # 把持仓调整到 0 股（全部卖出）
        order_target(g.security, 0)
