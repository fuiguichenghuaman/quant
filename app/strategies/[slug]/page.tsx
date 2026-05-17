/**
 * 策略详情页 - /strategies/[slug]
 *
 * 展示单个策略的完整档案，包含：
 * - 策略名称和描述
 * - 策略逻辑（通俗语言）
 * - 指标公式（代码块）
 * - 参数说明（表格）
 * - 风险声明
 * - 合规声明
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ============================================
   策略数据类型
   ============================================ */

interface StrategyParam {
  name: string;
  defaultValue: string;
  description: string;
}

interface Strategy {
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

/* ============================================
   策略数据
   ============================================ */

const strategies: Strategy[] = [
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
      {
        name: "初始资金",
        defaultValue: "100,000",
        description: "回测起始资金",
      },
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
      {
        name: "信号线周期",
        defaultValue: "9",
        description: "DEA 的 EMA 周期",
      },
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
      {
        name: "回溯周期",
        defaultValue: "9",
        description: "RSV 计算的天数",
      },
      { name: "超买线", defaultValue: "80", description: "J 值超买阈值" },
      { name: "超卖线", defaultValue: "20", description: "J 值超卖阈值" },
    ],
  },
];

/* ============================================
   辅助函数
   ============================================ */

function getStrategyBySlug(slug: string): Strategy | undefined {
  return strategies.find((s) => s.slug === slug);
}

/* ============================================
   generateStaticParams
   ============================================ */

export function generateStaticParams() {
  return strategies.map((strategy) => ({
    slug: strategy.slug,
  }));
}

/* ============================================
   动态 Metadata
   ============================================ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    return { title: "策略未找到" };
  }

  return {
    title: strategy.name,
    description: strategy.description,
  };
}

/* ============================================
   状态配置
   ============================================ */

const statusConfig: Record<string, { text: string; dot: string; bg: string }> = {
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

/* ============================================
   页面组件
   ============================================ */

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    notFound();
  }

  const status = statusConfig[strategy.status];

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      {/* ===== 面包屑导航 ===== */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link
          href="/strategies"
          className="transition-colors hover:text-accent-red"
        >
          策略档案
        </Link>
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
        <span className="text-foreground">{strategy.name}</span>
      </nav>

      {/* ===== 策略头部 ===== */}
      <header className="mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            {strategy.name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.bg}`}
          >
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.text}
          </span>
        </div>

        <p className="mb-4 text-lg leading-relaxed text-muted">
          {strategy.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {strategy.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-yellow/15 px-3 py-1 text-sm text-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* ===== 策略逻辑 ===== */}
      <section className="mb-12">
        <h2
          className="mb-4 text-xl font-semibold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          策略逻辑
        </h2>
        <div className="rounded-xl border border-border bg-card-bg p-6">
          <p className="text-base leading-relaxed text-foreground/80">
            {strategy.logic}
          </p>
        </div>
      </section>

      {/* ===== 指标公式 ===== */}
      <section className="mb-12">
        <h2
          className="mb-4 text-xl font-semibold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          指标公式
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-foreground/[0.03] px-4 py-2.5">
            <div className="h-3 w-3 rounded-full bg-accent-red/60" />
            <div className="h-3 w-3 rounded-full bg-accent-yellow/60" />
            <div className="h-3 w-3 rounded-full bg-accent-green/60" />
            <span className="ml-2 text-xs text-muted">公式</span>
          </div>
          <pre className="overflow-x-auto bg-code-bg p-5">
            <code className="text-sm leading-relaxed text-border">
              {strategy.formula}
            </code>
          </pre>
        </div>
      </section>

      {/* ===== 参数说明 ===== */}
      <section className="mb-12">
        <h2
          className="mb-4 text-xl font-semibold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          参数说明
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card-bg">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.02]">
                <th className="px-5 py-3 text-sm font-semibold text-foreground">
                  参数
                </th>
                <th className="px-5 py-3 text-sm font-semibold text-foreground">
                  默认值
                </th>
                <th className="px-5 py-3 text-sm font-semibold text-foreground">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              {strategy.params.map((param, index) => (
                <tr
                  key={param.name}
                  className={
                    index < strategy.params.length - 1
                      ? "border-b border-border"
                      : ""
                  }
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                    {param.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="rounded bg-foreground/[0.05] px-2 py-0.5 text-sm text-foreground">
                      {param.defaultValue}
                    </code>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">
                    {param.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== 风险声明 ===== */}
      <section className="mb-12">
        <div className="rounded-xl border-2 border-accent-yellow/30 bg-accent-yellow/5 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0 text-accent-yellow"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                风险提示
              </h3>
              <ul className="space-y-2 text-sm leading-relaxed text-foreground/70">
                <li>
                  <span className="mr-1.5 text-accent-red">*</span>
                  本策略仅为个人学习研究记录，不构成任何投资建议。
                </li>
                <li>
                  <span className="mr-1.5 text-accent-red">*</span>
                  回测结果基于历史数据，不代表真实交易表现，过往业绩不预示未来收益。
                </li>
                <li>
                  <span className="mr-1.5 text-accent-red">*</span>
                  真实交易涉及手续费、滑点、流动性等因素，可能与回测结果存在显著差异。
                </li>
                <li>
                  <span className="mr-1.5 text-accent-red">*</span>
                  股市有风险，投资需谨慎。请根据自身风险承受能力做出独立判断。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 合规声明 ===== */}
      <section className="border-t border-border pt-8">
        <div className="rounded-lg bg-foreground/[0.02] px-6 py-5">
          <p className="text-center text-sm leading-relaxed text-muted">
            本策略仅为个人学习研究记录，不构成投资建议。不荐股、不承诺收益、不带单。回测结果不代表真实交易表现。
          </p>
        </div>
      </section>

      {/* ===== 返回链接 ===== */}
      <div className="mt-8 text-center">
        <Link
          href="/strategies"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent-red"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          返回策略档案
        </Link>
      </div>
    </div>
  );
}
