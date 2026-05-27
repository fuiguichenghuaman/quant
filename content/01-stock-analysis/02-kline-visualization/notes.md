# 学习笔记：K 线图可视化

## 核心概念

### 什么是 K 线图？

K 线图（Candlestick Chart）是金融分析中最常用的图表类型。每根 K 线代表一个交易日的价格变动，由四个价格组成：

- **开盘价（Open）**：当天第一笔成交价
- **收盘价（Close）**：当天最后一笔成交价
- **最高价（High）**：当天成交价的最高值
- **最低价（Low）**：当天成交价的最低值

K 线的"实体"部分是开盘价和收盘价之间的区域，上下的"影线"分别延伸到最高价和最低价。

### A 股配色习惯

在 A 股市场中，K 线的配色习惯与欧美市场相反：

- **红色**：上涨（收盘价 > 开盘价）
- **绿色**：下跌（收盘价 < 开盘价）

欧美市场通常用绿色表示上涨、红色表示下跌。写代码时要注意这个区别。

### mplfinance 库

`mplfinance` 是专门画金融图表的 Python 库，基于 matplotlib 封装。它能直接画出：

- K 线图（蜡烛图）
- 成交量柱状图
- 移动平均线叠加
- 各种技术指标

核心函数是 `mpf.plot()`，传入一个以日期为索引的 DataFrame 即可。

---

## 生活化例子

### 用一根 K 线理解价格结构

假设某只股票 5 月 16 日的数据：

- 开盘价：10.00
- 收盘价：12.00
- 最高价：13.00
- 最低价：9.00

画出来的 K 线是这样的：

```
    |        <- 上影线，到 13.00
    |
  ┌─┴─┐      <- 实体顶部，收盘价 12.00
  │   │      <- 实体部分（红色，因为涨了）
  │   │
  └─┬─┘      <- 实体底部，开盘价 10.00
    |
    |        <- 下影线，到 9.00
```

- 实体部分 = 开盘价到收盘价的范围
- 上影线 = 收盘价到最高价
- 下影线 = 开盘价到最低价

### 成交量的意义

同一天成交量 500000 手，表示这天有 50 万手股票被买卖。

- 成交量大 + 价格上涨：多方力量强
- 成交量大 + 价格下跌：空方力量强
- 成交量小：市场观望情绪重

### 均线叠加

在 K 线图上叠加 5 日和 10 日均线后，你可以看到：

- 5 日均线更贴近价格，波动更大
- 10 日均线更平滑，趋势更明显
- 两条线交叉时，可能意味着趋势变化

---

## 容易出错的地方

### 1. CSV 没有表头却忘了写 `header=None`

这样第一行真实数据会被错误当成列名，后面所有列名都会错位。

### 2. 忘记把 date 列转成 datetime

```python
df["date"] = pd.to_datetime(df["date"])  # 必须有这一步
```

如果跳过这一步，mplfinance 的时间轴会出问题。

### 3. 忘记把 date 设为索引

```python
df = df.set_index("date")  # 必须有这一步
```

mplfinance 要求日期在索引位置上，否则无法正确画图。

### 4. 颜色字符串写错

```python
up='red,'    # 错！多了个逗号
up='red'     # 对！
```

### 5. `mav` 传的是周期，不是数据

```python
mav=[5, 10]       # 对！传的是均线周期
mav=some_array    # 错！不是传你自己算的均线数据
```

### 6. 服务器环境用 plt.show()

`plt.show()` 需要 GUI 环境，服务器上会报错。应该用 `plt.savefig()` 或 `mpf.plot(..., savefig=...)` 保存为文件。

---

## 固定写法与可修改部分

### 不要随便改的固定写法

```python
import pandas as pd
import matplotlib.pyplot as plt
import mplfinance as mpf
from mplfinance.original_flavor import candlestick2_ochl

pd.read_csv(..., header=None, encoding="utf-8-sig")
df["date"] = pd.to_datetime(df["date"])
df = df.set_index("date")
```

### 可以根据需求改的参数

| 参数 | 含义 | 示例 |
|------|------|------|
| `DATA_FILE` | 数据文件路径 | 换成别的 CSV 就读别的数据 |
| `width=0.75` | K 线柱体宽度 | 改大更粗，改小更细 |
| `colorup="red"` | 上涨颜色 | A 股用红色，欧美用绿色 |
| `colordown="green"` | 下跌颜色 | A 股用绿色，欧美用红色 |
| `mav=[5, 10]` | 均线周期 | 改成 [20, 60] 看中长期 |
| `volume=True` | 是否显示成交量 | 改成 False 就只看 K 线 |
| `datetime_format="%Y-%m-%d"` | 日期格式 | 可改成其他格式 |

---

## mplfinance 常用参数速查

```python
mpf.plot(
    df,                          # DataFrame，日期为索引
    type="candle",               # 图表类型：candle / line / renko / pnf
    mav=[5, 10, 20],             # 均线周期列表
    volume=True,                 # 是否显示成交量
    style=my_style,              # 样式配置
    title="标题",                # 图标题
    ylabel="price",              # 价格纵轴标签
    ylabel_lower="volume",       # 成交量纵轴标签
    show_nontrading=False,       # 是否显示非交易日
    datetime_format="%Y-%m-%d",  # 日期格式
    xrotation=45,                # 横坐标旋转角度
    tight_layout=True,           # 紧凑布局
    savefig="output.png",        # 保存为文件
)
```

---

## 学完这一节你掌握了什么

1. K 线图的四个核心价格：开盘价、收盘价、最高价、最低价
2. A 股红涨绿跌的配色习惯
3. 用 `candlestick2_ochl()` 画基础 K 线图
4. 用 `mplfinance` 画带成交量的专业 K 线图
5. 用 `mav=[5, 10]` 在 K 线图上叠加均线
6. 为什么日期要先转 datetime 再设为索引
7. 服务器环境下用 `savefig` 代替 `show()`

这些都是量化可视化的基础，后面画策略回测图、指标分析图都会用到。
