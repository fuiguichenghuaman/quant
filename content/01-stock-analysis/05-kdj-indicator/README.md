# KDJ 指标

## 这个模块学什么

用 pandas 计算 KDJ 技术指标，并用 matplotlib 绘制 KDJ 图：

- 理解 KDJ 的计算原理：RSV -> K -> D -> J
- 掌握 rolling 窗口和 expanding 窗口的用法
- 学会用 fillna() 处理窗口不足时的缺失值
- 绘制 K、D、J 三条指标线

## 为什么学这个

KDJ 是最常用的技术指标之一，和 MACD 一样属于"技术指标入门"。它更偏向观察价格在最近一段区间里的相对位置和波动节奏。掌握 KDJ 之后，你可以把它和 MACD、均线等指标放在一起做综合分析。

## 学完能做什么

- 能用 pandas 的 rolling 窗口计算技术指标
- 能理解 RSV、K、D、J 的含义和计算过程
- 能用 matplotlib 绘制指标图
- 能区分工具函数和完整流程函数的代码组织方式
- 为后续学习综合指标图和策略编写打下基础

## 前置知识

- Python 基础语法
- pandas 基本操作（读取 CSV、DataFrame 操作）
- matplotlib 基本画图

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
cd content/01-stock-analysis/05-kdj-indicator
pip install pandas matplotlib
python main.py
```

运行后会在 `output/` 目录下生成 KDJ 图表。

## 下一步学什么

- **综合指标图**：把 KDJ 和 K 线、MACD、均线放在同一张图里
- **KDJ 交叉信号**：观察 K、D、J 三条线的交叉
- **策略编写**：用 KDJ 指标生成买卖信号
