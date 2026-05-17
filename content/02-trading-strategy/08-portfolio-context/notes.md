# 模块 08: 账户结构与持仓检查

## 今天学什么

这个模块解决一个很实际的问题：策略怎么知道"我现在手里有没有股票"？

前面模块 07 的 MA5 策略用 `context.portfolio.positions[security].closeable_amount > 0` 来判断有没有可卖仓位。这个模块更深入地学习：

1. `context.portfolio` 到底包含哪些信息
2. `context.portfolio.positions` 是什么结构
3. 如何用持仓状态来驱动交易逻辑
4. 回测环境的完整设置（手续费、滑点、基准、成交量限制）
5. 不同调度频率（每天 vs 每月）对策略行为的影响
6. 为什么同样代码在不同环境下回测结果可能不同

## 核心概念

### context.portfolio —— 账户对象

`context.portfolio` 是聚宽平台自动维护的账户对象，它包含了你策略运行时的所有财务状态。你可以把它想象成一个"实时更新的账户报表"。

常用属性：

| 属性 | 含义 |
|------|------|
| `context.portfolio.available_cash` | 当前可用现金 |
| `context.portfolio.total_value` | 账户总资产（现金 + 股票市值） |
| `context.portfolio.positions` | 当前所有持仓，是一个字典 |
| `context.portfolio.returns` | 累计收益率 |

### context.portfolio.positions —— 持仓字典

`context.portfolio.positions` 是一个字典，键是股票代码，值是持仓对象。

```python
# 判断某只股票有没有持仓
if g.security in context.portfolio.positions:
    # 有持仓
    pass

if g.security not in context.portfolio.positions:
    # 没有持仓
    pass
```

每个持仓对象（比如 `context.portfolio.positions['000001.XSHE']`）还有更多属性：

| 属性 | 含义 |
|------|------|
| `total_amount` | 持仓总股数 |
| `closeable_amount` | 可卖出的股数（排除今天刚买的） |
| `avg_cost` | 持仓均价 |
| `market_value` | 持仓市值 |

### 三种下单方式的区别

| 函数 | 含义 | 示例 |
|------|------|------|
| `order(security, amount)` | 按股数下单 | `order('000001.XSHE', 1000)` 买 1000 股 |
| `order_value(security, value)` | 按金额下单 | `order_value('000001.XSHE', 10000)` 用 1 万元买 |
| `order_target(security, amount)` | 按目标持仓下单 | `order_target('000001.XSHE', 0)` 清仓 |

`order()` 最直观：正数买入，负数卖出。
`order_value()` 适合"我有多少钱就买多少"的场景。
`order_target()` 适合"我要把持仓调整到某个数量"的场景。

### 回测环境设置

一份完整的策略不只是"买卖逻辑"，还包括"在什么环境下运行"：

| 设置 | 函数 | 作用 |
|------|------|------|
| 比较基准 | `set_benchmark()` | 回测时用什么指数做对比 |
| 交易成本 | `set_order_cost()` | 每次交易扣多少手续费 |
| 滑点 | `set_slippage()` | 成交价和理想价之间的偏差 |
| 成交量限制 | `set_option('order_volume_ratio', ...)` | 单笔订单最多吃掉多少市场成交量 |
| 真实价格 | `set_option('use_real_price', True)` | 让成交价更接近真实交易 |

这些设置不改变策略逻辑本身，但会改变回测结果。就像同一场考试，开卷和闭卷的成绩肯定不一样。

### 调度频率

聚宽提供多种调度函数：

| 函数 | 频率 |
|------|------|
| `run_daily(func, time=...)` | 每天执行 |
| `run_monthly(func, day, time=...)` | 每月执行 |
| `run_weekly(func, day, time=...)` | 每周执行 |

调度频率不同，策略行为会完全不同。一个每天交易的策略和一个每月交易的策略，即使买卖逻辑一样，结果也会差很多。

## 关键 API / 函数

### 初始化相关

| 函数 | 作用 |
|------|------|
| `initialize(context)` | 策略初始化入口 |
| `set_benchmark('000300.XSHG')` | 设沪深 300 为基准 |
| `run_daily(market_open, time='9:30')` | 每天 9:30 执行 |
| `run_monthly(market_open, 1, time='open')` | 每月第 1 个交易日开盘执行 |
| `set_order_cost(OrderCost(...), type='stock')` | 设置交易成本 |
| `set_slippage(PriceRelatedSlippage(0.002), type='stock')` | 设置滑点 |
| `set_option('order_volume_ratio', 0.5)` | 设置成交量限制 |
| `set_option('use_real_price', True)` | 开启真实价格模式 |

### 交易相关

| 函数 | 作用 |
|------|------|
| `order(security, amount)` | 按股数下单（正数买，负数卖） |
| `context.portfolio.positions` | 持仓字典 |
| `context.portfolio.available_cash` | 可用现金 |

## 代码解读

### initialize 阶段

```python
def initialize(context):
    g.security = '000001.XSHE'
    set_benchmark('000300.XSHG')
    run_daily(market_open, time='9:30')
    set_order_cost(OrderCost(open_commission=0.03, close_commission=0.03, ...), type='stock')
    set_slippage(PriceRelatedSlippage(0.002), type='stock')
    set_option('order_volume_ratio', 0.5)
    set_option('use_real_price', True)
```

这段代码做了"布置实验室"的工作：
1. 选定交易标的
2. 设定比较基准
3. 注册每天 9:30 执行交易逻辑
4. 设定手续费模型
5. 设定滑点模型
6. 设定成交量限制
7. 开启真实价格模式

这些设置让回测环境更接近真实交易，结果更有参考价值。

### market_open 阶段

```python
def market_open(context):
    if g.security not in context.portfolio.positions:
        order(g.security, 1000)
    else:
        order(g.security, -800)
```

逻辑非常简单：
- 没有持仓 -> 买 1000 股
- 有持仓 -> 卖 800 股

因为 1000 - 800 = 200，卖一次还剩 200 股，所以需要再卖一次才能清仓。实际节奏是：买入 -> 卖出 800 -> 卖出剩余 -> 重新买入，大约三天一个周期。

### 关于回测结果差异

同样代码、同样区间、同样初始资金，不同人跑出来的收益可能不完全一样。这不是代码错误，而是回测环境细节不同：

- 平台默认手续费可能不同
- 平台默认滑点可能不同
- 是否开启真实价格模式
- 回测引擎版本可能更新过
- 复权价格口径可能有差异

量化学习中，不能只盯着收益数字，还要关注实验条件是否一致。

## 学习心得

1. **持仓字典是策略的"记忆"**。`context.portfolio.positions` 让策略知道"我现在手里有什么"，这是做出交易决策的基础。没有这个信息，策略就是盲人摸象。

2. **回测环境设置不是可有可无的**。手续费、滑点这些看起来是"小细节"，但累积起来对结果影响很大。一个在理想条件下回测赚钱的策略，加上真实交易成本后可能就亏钱了。

3. **`Ture` 这种拼写错误是新手常犯的**。Python 的布尔值是 `True`（大写 T），不是 `Ture`。这种错误在聚宽平台上运行时会直接报 NameError，但在代码审查时很容易忽略。

4. **佣金参数的量级很重要**。0.03（3%）和 0.0003（万分之三）差了 100 倍。写策略时一定要确认参数的金融含义，不能只看数字。

5. **`order()` 和 `order_target()` 的区别很实用**。`order()` 是"这次买卖多少"，`order_target()` 是"我要把持仓调整到多少"。在清仓场景下，`order_target(security, 0)` 比 `order(security, -持仓量)` 更简洁可靠。

6. **同样代码不同结果，不一定是 bug**。量化学习中，"实验条件"和"代码逻辑"同样重要。这和做科学实验的道理一样——控制变量才能对比结果。

7. **调度频率是策略的重要参数**。每天看一次和每月看一次，策略的行为模式完全不同。高频不一定比低频好，关键是和策略逻辑匹配。

## 下一步

- 深入学习 `context.portfolio` 的更多属性（总资产、收益率等）
- 学习持仓对象的更多属性（均价、市值、可卖数量等）
- 学习子账户概念（股票账户、期货账户等）
- 尝试在策略中加入日志，每天打印账户状态
- 学习更复杂的持仓管理：分批建仓、止损止盈
- 尝试双均线策略（MA5 和 MA10 交叉）
