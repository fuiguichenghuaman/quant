import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "学习路径",
};

const modules = [
  {
    slug: "01-numpy-basics",
    title: "NumPy 股票数据基础",
    description:
      "用 NumPy 读取股票 CSV 数据，计算最大值、最小值、均值、方差、SMA、EMA 等基础指标。",
    tags: ["基础", "NumPy"],
    status: "available" as const,
  },
  {
    slug: "02-kline-visualization",
    title: "K 线图可视化",
    description: "用 matplotlib 和 mplfinance 绘制 K 线图，叠加成交量和均线，理解 A 股红涨绿跌配色。",
    tags: ["基础", "可视化"],
    status: "available" as const,
  },
  {
    slug: "03-macd-indicator",
    title: "MACD 指标",
    description: "计算 MACD 指标（DIF、DEA、BAR），画出红绿柱状图，理解指数移动平均。",
    tags: ["指标", "策略"],
    status: "available" as const,
  },
  {
    slug: "04-pandas-basics",
    title: "Pandas 股票数据基础",
    description:
      "用 pandas 读取 CSV 数据，掌握 DataFrame 操作：日期处理、分组统计、涨跌计算。",
    tags: ["基础", "Pandas"],
    status: "available" as const,
  },
  {
    slug: "05-kdj-indicator",
    title: "KDJ 指标",
    description:
      "计算 KDJ 指标（K、D、J 三线），理解 rolling 窗口和 expanding 窗口，绘制 KDJ 图。",
    tags: ["指标", "可视化"],
    status: "available" as const,
  },
  {
    slug: "06-all-indicators",
    title: "综合技术指标图",
    description:
      "把 K 线、均线、成交量、MACD、KDJ 整合到一张图里，四区域综合展示。",
    tags: ["综合", "可视化"],
    status: "available" as const,
  },
];

const statusLabel: Record<string, { text: string; dot: string }> = {
  available: { text: "可学习", dot: "bg-accent-green" },
  "coming-soon": { text: "即将上线", dot: "bg-muted/40" },
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <h1
        className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        学习路径
      </h1>
      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted">
        从 NumPy 基础开始，一步步掌握量化分析的核心技能。每个模块都有完整的代码、讲解和学习笔记。
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const status = statusLabel[mod.status];
          const isAvailable = mod.status === "available";

          const card = (
            <div
              className={`group flex flex-col rounded-xl border border-border bg-card-bg shadow-sm transition-all ${
                isAvailable
                  ? "hover:shadow-md hover:-translate-y-0.5"
                  : "opacity-60"
              }`}
            >
              {/* Preview placeholder */}
              <div className="flex h-28 items-center justify-center rounded-t-xl bg-foreground/5 text-sm text-muted/50">
                {isAvailable ? (
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {isAvailable ? "可学习" : "即将上线"}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-accent-red transition-colors">
                    {mod.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      isAvailable ? "text-accent-green" : "text-muted"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.text}
                  </span>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
                  {mod.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-yellow/15 px-2.5 py-0.5 text-xs text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );

          if (isAvailable) {
            return (
              <Link key={mod.slug} href={`/learn/${mod.slug}`}>
                {card}
              </Link>
            );
          }

          return (
            <div key={mod.slug} className="cursor-not-allowed">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
