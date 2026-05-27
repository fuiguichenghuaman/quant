/* ============================================
   策略数据 - 共享数据源
   ============================================ */

export interface StrategyParam {
  name: string;
  defaultValue: string;
  description: string;
}

export interface Strategy {
  slug: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
  status: "verified" | "researching";
  logic: string;
  formula: string;
  params: StrategyParam[];
}

export const statusConfig: Record<
  string,
  { text: string; dot: string; bg: string }
> = {
  verified: {
    text: "已验证",
    dot: "bg-accent-green",
    bg: "bg-accent-green/10 text-accent-green",
  },
  researching: {
    text: "研究中",
    dot: "bg-accent-yellow",
    bg: "bg-accent-yellow/10 text-foreground/70",
  },
};

export const strategies: Strategy[] = [
  {
    slug: "ma-crossover",
    name: "MA 均线交叉策略",
    description: "基于短期和长期移动平均线的交叉信号进行交易",
    type: "趋势跟踪",
    tags: ["均线", "趋势跟踪", "入门"],
    status: "verified",
    logic:
      "当短期均线（如 MA5）上穿长期均线（如 MA20）时买入，表示短期趋势向上；当短期均线下穿长期均线时卖出，表示短期趋势向下。",
    formula: `SMA(N) = (C1 + C2 + ... + CN) / N

买入信号: SMA(short) > SMA(long) 且之前 SMA(short) <= SMA(long)
卖出信号: SMA(short) < SMA(long) 且之前 SMA(short) >= SMA(long)`,
    params: [
      { name: "短期窗口", defaultValue: "5", description: "短期均线周期" },
      { name: "长期窗口", defaultValue: "20", description: "长期均线周期" },
      { name: "初始资金", defaultValue: "100,000", description: "回测起始资金" },
    ],
  },
  {
    slug: "macd",
    name: "MACD 策略",
    description: "基于 MACD 指标的 DIF 和 DEA 线交叉信号进行交易",
    type: "趋势跟踪",
    tags: ["MACD", "趋势跟踪", "经典"],
    status: "verified",
    logic:
      "MACD（移动平均收敛散度）通过计算两条不同周期的指数移动平均线之差来判断趋势。当 DIF 线上穿 DEA 线时，表示短期动量增强，买入；当 DIF 线下穿 DEA 线时，表示短期动量减弱，卖出。",
    formula: `EMA(N) = 收盘价 * 2/(N+1) + 前一日EMA * (N-1)/(N+1)

DIF = EMA(12) - EMA(26)
DEA = DIF 的 9 日 EMA
MACD柱 = 2 * (DIF - DEA)

买入信号: DIF > DEA 且之前 DIF <= DEA
卖出信号: DIF < DEA 且之前 DIF >= DEA`,
    params: [
      { name: "快线周期", defaultValue: "12", description: "短期 EMA 周期" },
      { name: "慢线周期", defaultValue: "26", description: "长期 EMA 周期" },
      { name: "信号线周期", defaultValue: "9", description: "DEA 的 EMA 周期" },
    ],
  },
  {
    slug: "kdj-overbought",
    name: "KDJ 超买超卖策略",
    description: "基于 KDJ 指标的超买超卖区域进行交易",
    type: "反转策略",
    tags: ["KDJ", "超买超卖", "反转"],
    status: "researching",
    logic:
      "KDJ 指标通过计算当前价格在近期价格区间中的位置来判断超买超卖。当 K 线从下方穿越 D 线且 J 值低于 20（超卖区）时买入；当 K 线从上方穿越 D 线且 J 值高于 80（超买区）时卖出。",
    formula: `RSV = (收盘价 - N日最低价) / (N日最高价 - N日最低价) * 100

K = 2/3 * 前一日K + 1/3 * RSV
D = 2/3 * 前一日D + 1/3 * K
J = 3*K - 2*D

买入信号: K > D 且之前 K <= D 且 J < 20
卖出信号: K < D 且之前 K >= D 且 J > 80`,
    params: [
      { name: "回溯周期", defaultValue: "9", description: "RSV 计算的天数" },
      { name: "超买线", defaultValue: "80", description: "J 值超买阈值" },
      { name: "超卖线", defaultValue: "20", description: "J 值超卖阈值" },
    ],
  },
];

export function getStrategyBySlug(slug: string): Strategy | undefined {
  return strategies.find((s) => s.slug === slug);
}
