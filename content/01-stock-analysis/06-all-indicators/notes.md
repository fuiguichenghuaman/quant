# 学习笔记：综合技术指标图

## 核心概念

### 什么是综合指标图？

综合指标图是把前面学过的多个技术指标（K 线、均线、MACD、KDJ）放到同一张图里一起展示。它不是某一个单独指标的练习，而是"把多个基础知识整合起来"的练习。

### 四个区域分别看什么

| 区域 | 内容 | 看什么 |
|------|------|--------|
| 顶部 | 蜡烛图 + 均线 | 价格形态和趋势 |
| 第二块 | 成交量 | 交易活跃度 |
| 第三块 | MACD | 短中期趋势差异和动能变化 |
| 第四块 | KDJ | 价格在区间里的位置和波动节奏 |

### 工具函数 vs 完整流程函数

这份代码把函数分成了两类：

**工具函数**（每个只做一件小事）：
- `load_price_data()`：读取并整理基础价格数据
- `cal_ma()`：计算均线
- `cal_macd()`：计算 MACD
- `cal_kdj()`：计算 KDJ
- `build_up_down_colors()`：准备红绿颜色列表

**完整流程函数**（把工具串起来）：
- `plot_all_indicators()`：读数据 -> 算指标 -> 画图 -> 保存图

### subplots 子图布局

`plt.subplots(4, 1, ...)` 创建 4 个上下排列的子图区域：
- `sharex=True`：4 个子图共用同一套横坐标，日期上下对齐
- `height_ratios`：控制 4 个区域的高度比例

---

## 生活化例子

### 用"体检报告"理解综合图

你可以把这份综合图理解成"股票的体检报告"：

- **K 线**：看价格形态，像看"体温曲线"
- **均线**：看趋势，像看"血压的移动平均"
- **成交量**：看热度，像看"心率"
- **MACD**：看动能，像看"运动后的恢复速度"
- **KDJ**：看区间位置，像看"体重在正常范围里的位置"

一份完整的体检报告不会只看一个指标，股票分析也一样。

### 红绿颜色的含义

- **红色**：收盘价 >= 开盘价，表示"涨了"（A 股习惯）
- **绿色**：收盘价 < 开盘价，表示"跌了"（A 股习惯）

注意：A 股和美股的颜色习惯是反过来的。

---

## 容易出错的地方

### 1. 忘记 CSV 没有表头

如果漏掉 `header=None`，第一行真实数据会被当成列名。

### 2. 忘记 close、high、low、open、volume 必须是数字

否则指标计算会出问题。

### 3. 忘记日期列要先转成 datetime

否则后面日期显示和时间序列处理会不够规范。

### 4. 忘记给输出目录建文件夹

如果直接保存图片，但 output 目录还不存在，就可能失败。代码里已经用 `mkdir(parents=True, exist_ok=True)` 处理了。

### 5. 横坐标日期显示太密

如果以后数据量更大，不做间隔控制，日期会挤成一团。代码里已经用 `tick_step` 做了间隔控制。

### 6. 服务器环境不能用 plt.show()

必须用 `plt.savefig()` 保存为图片文件。

### 7. mplfinance 没安装

会报：`ModuleNotFoundError: No module named 'mplfinance'`

解决方法：`pip install mplfinance`

---

## 固定写法与可修改部分

### 不要随便改的固定写法

```python
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # 服务器环境必须加
import matplotlib.pyplot as plt
from mplfinance.original_flavor import candlestick2_ochl

pd.read_csv(..., header=None, encoding="utf-8-sig")
df["date"] = pd.to_datetime(df["date"])
df["close"].rolling(...).mean()
df["close"].ewm(...).mean()
plt.savefig(...)  # 服务器环境用这个
```

### 可以根据需求改的参数

| 参数 | 含义 | 示例 |
|------|------|------|
| `DATA_FILE` | 数据文件路径 | 换成别的 CSV 就读别的数据 |
| `OUTPUT_FILE` | 输出图片路径 | 改成别的路径 |
| `ma_periods=(5, 10)` | 画哪些均线 | 可以加 20 日均线 |
| `fastperiod=12, slowperiod=26, signalperiod=9` | MACD 参数 | 经典参数，一般不改 |
| `rolling(9, min_periods=9)` | KDJ 观察区间 | 可以改成 14 |
| `figsize=(16, 12)` | 整张图大小 | 只影响图表美观 |
| `width=0.65` | K 线柱体宽度 | 只影响图表美观 |
| 各种 `color=...` | 颜色 | 只影响图表美观 |

---

## 学完这一节你掌握了什么

1. 你会读取和整理股票 CSV 数据
2. 你会计算均线（MA5、MA10）
3. 你会计算 MACD（DIF、DEA、BAR）
4. 你会计算 KDJ（K、D、J）
5. 你会把蜡烛图、均线、成交量、MACD、KDJ 放到同一张图里
6. 你开始接触"综合展示型"图表，而不再只是单个指标练习

这段代码在量化交易学习里的意义很大：
- 它说明你已经从"单个知识点练习"走到了"知识整合"
- 后面你做复盘、做公开展示、做策略观察时，这类综合图会很有用
