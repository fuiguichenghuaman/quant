# Pandas 股票数据基础

## 这个模块学什么

用 pandas 读取股票 CSV 数据，掌握 DataFrame 的核心操作：

- 读取 CSV 并查看表格信息和统计概况
- 日期列处理：字符串转 datetime，提取年份和月份
- 找最小收盘价及对应整行
- 按月份分组统计平均收盘价和开盘价
- 计算涨跌额和涨跌比例

## 为什么学这个

pandas 是 Python 数据分析的核心库。前面用 NumPy 处理的是"一列数字"，而 pandas 处理的是"一张完整的表"。后面的策略编写、回测验证、指标计算，几乎都建立在 DataFrame 之上。掌握 pandas 就是掌握了量化分析的"表格引擎"。

## 学完能做什么

- 能用 pandas 读取任意 CSV 格式的数据
- 能对 DataFrame 做列命名、类型转换、新增列
- 能用 groupby() 做分组统计
- 能用 diff() 和 shift() 计算变化率
- 为后续学习指标计算和策略编写打下基础

## 前置知识

- Python 基础语法（变量、函数、列表）
- 了解 NumPy 基本操作
- 了解 CSV 文件格式

## 文件说明

| 文件 | 用途 |
|------|------|
| `main.py` | 主脚本，可以直接运行，包含所有功能 |
| `explained.py` | 讲解版，逐行注释，适合学习阅读 |
| `notes.md` | 学习笔记，核心概念、踩坑记录、速查表 |
| `README.md` | 本文件，模块导读 |
| `output/` | 运行后生成的图表存放目录 |

## 运行方式

```bash
cd content/01-stock-analysis/04-pandas-basics
pip install pandas matplotlib
python main.py
```

## 下一步学什么

- **KDJ 指标**：用 pandas 的 rolling 窗口计算 KDJ
- **综合指标图**：把多个指标整合到一张图里
- **均线交叉策略**：用 DataFrame 生成买卖信号
- **回测框架**：验证策略的历史表现
