# 学习笔记：Pandas 股票数据基础

## 核心概念

### 什么是 pandas？

pandas 是 Python 里最常用的表格数据处理库。你可以把它理解成一个"非常会管理表格的 Excel 助手"——CSV、Excel、带行列结构的数据，都适合用 pandas 来处理。

固定写法：`import pandas as pd`，看到 `pd` 基本就是 pandas。

### 什么是 DataFrame？

DataFrame 是 pandas 里最核心的数据结构，就是一张"有行有列的表"。你可以对它做读取、筛选、分组、统计、新增列等操作。

### diff() 和 shift()

- `df["close"].diff()`：今天收盘价 - 上一行收盘价，得到"涨跌额"
- `df["close"].shift(1)`：把整列往下移一行，当前行拿到的是"上一行的值"
- `df["close"].shift(-1)`：把整列往上移一行，当前行拿到的是"下一行的值"

### groupby() 分组统计

`df.groupby("month")["close"].mean()` 的意思是：按月份分组，然后对每个月的收盘价求平均值。这是 pandas 里非常强大的能力。

---

## 生活化例子

### 把 pandas 想成"Excel 助手"

比如你的 CSV 像这样：

```
股票代码, 日期, 收盘价, 开盘价, 最高价, 最低价, 成交量
000001.SZ, 2009/1/5, 9.71, 9.57, 9.74, 9.51, 340827
000001.SZ, 2009/1/6, 10.30, 9.80, 10.43, 9.73, 635330
```

- `pd.read_csv()` 的意思就是："请把这个文件读成一张 Python 里的表。"
- `df["close"]` 的意思就是："请把这张表里的收盘价这一列取出来。"
- `df["close"].min()` 的意思就是："请你在收盘价这一列里，找出最小的那个值。"

### 理解 diff() 的涨跌额

假设连续 3 天收盘价是：10、12、11

- 第 1 天：diff = NaN（前面没有数据）
- 第 2 天：diff = 12 - 10 = 2（涨了 2 块）
- 第 3 天：diff = 11 - 12 = -1（跌了 1 块）

---

## 容易出错的地方

### 1. CSV 没有表头，却忘了写 header=None

这会导致第一行真实数据被 pandas 错当成列名，数据就少了一行。

### 2. 列名个数和数据列数对不上

`df.columns = [...]` 里的名字个数必须和 CSV 的列数一致，否则会报错。

### 3. 日期列没先转成 datetime

如果直接写 `.dt.year`、`.dt.month`，会报错。必须先用 `pd.to_datetime()` 转换。

### 4. diff() 默认是和上一行做差

如果你的数据顺序变了（比如从新到旧排），金融含义也会跟着变。

### 5. shift(1) 和 shift(-1) 很容易写反

- `shift(1)` 通常表示"上一行"
- `shift(-1)` 通常表示"下一行"

前提是你的数据是按日期从早到晚排序。

### 6. 环境里没安装 pandas

会报：`ModuleNotFoundError: No module named 'pandas'`

解决方法：`pip install pandas`

---

## 固定写法与可修改部分

### 不要随便改的固定写法

```python
import pandas as pd
from pathlib import Path

pd.read_csv(...)          # 参数名 header=、encoding= 都是 pandas 规定的
pd.to_datetime(...)       # 日期转换的固定写法
df["date"].dt.year        # 提取年份的固定写法
df.groupby("month")["close"].mean()  # 分组统计的固定写法
```

### 可以根据需求改的参数

| 参数 | 含义 | 示例 |
|------|------|------|
| `DATA_FILE` | 数据文件路径 | 换成别的 CSV 就读别的数据 |
| `df.columns = [...]` | 列名 | 根据 CSV 实际列数调整 |
| `header=None` | 是否有表头 | 如果 CSV 有表头就去掉这行 |
| `groupby("month")` | 分组字段 | 可以改成按年、按周分组 |
| `shift(1)` vs `shift(-1)` | 移位方向 | 取决于你想拿上一行还是下一行 |

---

## 学完这一节你掌握了什么

1. pandas 怎么读取一张没有表头的 CSV
2. DataFrame 怎么命名列
3. 怎么把日期列转成真正的时间类型
4. 怎么提取年份和月份
5. 怎么按月份做分组统计
6. 怎么找最小值和对应整行
7. 怎么用 diff() 和 shift() 计算涨跌额和涨跌比例

这些都是量化分析的"表格处理底座"，后面的策略、回测、指标计算都建立在 DataFrame 之上。
