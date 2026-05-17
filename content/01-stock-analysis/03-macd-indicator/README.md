# MACD 指标

## 这个模块学什么

用 Python 计算 MACD 指标，并将其可视化：

- MACD 的三部分：DIF（快线）、DEA（信号线）、BAR（柱状图）
- 用 pandas 的 `ewm()` 计算指数移动平均
- 画出 DIF 线、DEA 线和红绿柱状图
- 理解 12、26、9 参数的含义

## 为什么学这个

MACD 是量化分析中最常用的技术指标之一。它能帮你观察价格趋势的强弱变化，是技术分析入门的必学内容。学完这个模块，你就能从"看价格"进阶到"看指标"。

## 学完能做什么

- 理解 MACD 的计算原理（DIF、DEA、BAR）
- 能用 Python 从 CSV 数据计算 MACD
- 能画出标准的 MACD 图表
- 理解工具函数和完整流程函数的区别
- 为后续学习策略设计和回测打下基础

## 前置知识

- Python 基础语法（变量、函数、循环）
- 了解 pandas 的 DataFrame 基本操作
- 了解指数移动平均（EMA）的概念

建议先完成 [NumPy 股票数据基础](../01-numpy-basics/) 和 [K 线图可视化](../02-kline-visualization/) 模块。

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
cd content/01-stock-analysis/03-macd-indicator
pip install pandas matplotlib
python main.py
```

运行后会在 `output/` 目录下生成 MACD 图表。

## 下一步学什么

- **均线交叉策略**：用 DIF/DEA 交叉生成买卖信号
- **多指标组合**：把 MACD 和 K 线图画在同一张图里
- **回测框架**：验证策略的历史表现
