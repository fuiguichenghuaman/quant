"""
第一部分：整体说明

这个文件是 `4_量化实战_能量型指标策略.py` 的"讲解版脚本"。
它的任务不是代替主脚本，而是帮助你用老师讲课的方式理解：

1. 这份代码整体在做什么
2. 每一个函数为什么要这样写
3. 聚宽平台的 API 函数是从哪里来的
4. 能量型指标（BRAR、CR、VR）在量化交易中怎么用

这份脚本主要完成了一件事情：
用三个"能量型指标"来判断一只股票的买卖时机。

什么是能量型指标？
- 能量型指标衡量的是"买卖双方的力量对比"
- 就像拔河比赛，看哪边力气大
- BRAR：情绪指标，衡量多空双方的情绪
- CR：中间意愿指标，衡量买卖双方的中间意愿
- VR：成交量变异指标，衡量成交量的变化

买入条件（5 个同时满足）：
- AR < 100：多方力量弱
- BR < 100：空方力量弱
- BR < AR：多方比空方强
- CR < 100：中间意愿偏弱
- VR < 100：成交量偏低

卖出条件（4 个同时满足）：
- AR > 150：多方力量强
- BR > 150：空方力量强
- CR > 150：中间意愿强
- VR > 150：成交量高

输入数据是什么：
- 这份代码运行在聚宽平台上
- 聚宽提供 BRAR、CR、VR 指标的计算函数

输出结果是什么：
- 在聚宽回测引擎里模拟买卖
- 通过 log.info() 输出买入和卖出记录

代码运行的大致流程是什么：
1. initialize() 设置股票、交易费用
2. handle_data() 每个交易日运行，获取指标值，判断买卖

它在量化交易学习中属于哪一块内容：
- 属于"策略实战"阶段
- 学习用多个指标组合来判断买卖
- 能量型指标和趋势型指标（MA、MACD）不同，它们衡量的是"力量"而非"方向"

第二部分：代码运行流程

1. `def initialize(context):`
   初始化函数，设置股票、基准、交易费用

2. `def handle_data(context, data):`
   每个交易日运行的主函数

3. `BR1, AR1 = BRAR(security, ..., N=26)`
   计算 BRAR 情绪指标

4. `CR1, MA1, MA2, MA3, MA4 = CR(security, ..., N=26, ...)`
   计算 CR 中间意愿指标

5. `VR1, MAVR1 = VR(security, ..., N=26, M=6)`
   计算 VR 成交量变异指标

6. `if AR < 100 and BR < 100 and ...`
   5 个条件同时满足 → 买入

7. `elif AR > 150 and BR > 150 and ...`
   4 个条件同时满足 → 卖出

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
- `BRAR()` — 聚宽的 BRAR 指标计算函数
- `CR()` — 聚宽的 CR 指标计算函数
- `VR()` — 聚宽的 VR 指标计算函数
- `set_order_cost()` — 聚宽的交易费用设置 API
- `order_value()` — 聚宽的按金额下单 API
- `order_target()` — 聚宽的按目标持仓下单 API

可以根据需求修改的参数：
- `g.security = '000001.XSHE'` — 可以改成别的股票代码
- `N=26` — BRAR、CR、VR 的计算周期
- `M1=10, M2=20, M3=40, M4=62` — CR 的均线周期
- `M=6` — VR 的均线周期
- 买入条件里的 `< 100` — 可以改成 80、120 等
- 卖出条件里的 `> 150` — 可以改成 130、180 等

第六部分：容易出错的地方

1. `BRAR()` 返回的是两个字典，不是两个值
   要用 `BR1[security]` 才能拿到具体的值

2. `CR()` 返回的是 5 个值
   我们只用到 CR1，其他 4 个是不同周期的均线

3. `VR()` 返回的是 2 个值
   我们只用到 VR1，MAVR1 是 VR 的均线

4. 买入条件是 5 个"与"（and）关系
   必须全部满足才买入，少一个都不行

5. `handle_data()` 和 `market_open()` 的区别：
   - `handle_data()` 每个 bar 都运行
   - `market_open()` 只在开盘时运行一次

第七部分：用生活化例子解释核心逻辑

想象你去参加一场拍卖会：

AR 指标就像"买家的热情"：
- AR < 100 → 买家不太积极 → 可能是捡便宜的好时机
- AR > 150 → 买家非常积极 → 可能已经抢得太贵了

BR 指标就像"卖家的热情"：
- BR < 100 → 卖家不太积极 → 没什么人想卖
- BR > 150 → 卖家非常积极 → 大家都在抛售

当买家和卖家都不积极（AR < 100, BR < 100），
而且买家比卖家更积极（BR < AR），
说明市场冷清但有上涨潜力 → 买入

当买家和卖家都非常积极（AR > 150, BR > 150），
说明市场太疯狂了 → 卖出

第八部分：学习总结

通过这份代码，你现在已经开始接触：
- 什么是能量型指标（BRAR、CR、VR）
- 如何用多个指标组合来判断买卖
- 如何用 handle_data() 每个交易日运行策略
- 能量型指标和趋势型指标的区别

接下来你可以：
- 改一下指标参数（N=26），看看不同周期的效果
- 只用其中一两个指标，看看哪些指标最有效
- 在聚宽平台上运行回测，对比能量型策略和其他策略的收益
"""

# ============================================================
# 以下是带详细中文注释的代码
# ============================================================

"""
能量型指标量化交易策略 —— 讲解版

用 BRAR、CR、VR 三个能量型指标来判断买卖时机
"""

# ---- 导入聚宽的库 ----
from jqdata import *
from jqlib.technical_analysis import *


# ---- 初始化函数 ----
def initialize(context):
    # ---- 设置交易股票 ----
    g.security = '000001.XSHE'

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


# ---- 每个交易日运行的主函数 ----
# handle_data 和 market_open 的区别：
# - handle_data 每个 bar 都运行
# - market_open 只在开盘时运行一次
def handle_data(context, data):
    # 获取要交易的股票代码
    security = g.security

    # ---- 计算 BRAR 情绪指标 ----
    # BRAR() 返回两个字典：BR1 和 AR1
    # N=26: 计算周期为 26 天
    # BR: 情绪指标，衡量"买家的力量"
    # AR: 情绪指标，衡量"卖家的力量"
    BR1, AR1 = BRAR(
        security,
        check_date=context.current_dt,
        N=26
    )

    # ---- 计算 CR 中间意愿指标 ----
    # CR() 返回 5 个值
    # CR1: CR 指标值
    # MA1-MA4: CR 的不同周期均线
    # 我们只用到 CR1
    CR1, MA1, MA2, MA3, MA4 = CR(
        security,
        check_date=context.current_dt,
        N=26,
        M1=10,
        M2=20,
        M3=40,
        M4=62
    )

    # ---- 计算 VR 成交量变异指标 ----
    # VR() 返回 2 个值
    # VR1: VR 指标值
    # MAVR1: VR 的均线
    # 我们只用到 VR1
    VR1, MAVR1 = VR(
        security,
        check_date=context.current_dt,
        N=26,
        M=6
    )

    # ---- 获取当前可用现金 ----
    cash = context.portfolio.cash

    # ---- 买入信号判断 ----
    # 5 个条件必须同时满足：
    # 1. AR < 100: 多方力量弱（买家不积极）
    # 2. BR < 100: 空方力量弱（卖家不积极）
    # 3. BR < AR: 多方比空方强（买家比卖家积极）
    # 4. CR < 100: 中间意愿偏弱
    # 5. VR < 100: 成交量偏低（市场冷清）
    # 当市场冷清但有上涨潜力时，就是买入的好时机
    if AR1[security] < 100 and BR1[security] < 100 and BR1[security] < AR1[security] and CR1[security] < 100 and VR1[security] < 100:
        # 用所有可用现金买入
        order_value(security, cash)
        log.info("买入股票 %s" % (security))

    # ---- 卖出信号判断 ----
    # 4 个条件必须同时满足：
    # 1. AR > 150: 多方力量强（买家非常积极）
    # 2. BR > 150: 空方力量强（卖家非常积极）
    # 3. CR > 150: 中间意愿强
    # 4. VR > 150: 成交量高（市场疯狂）
    # 当市场太疯狂时，就是卖出的好时机
    elif AR1[security] > 150 and BR1[security] > 150 and CR1[security] > 150 and VR1[security] > 150 and context.portfolio.positions[security].closeable_amount > 0:
        # 把持仓调整到 0 股（全部卖出）
        order_target(security, 0)
        log.info("卖出股票 %s" % (security))
