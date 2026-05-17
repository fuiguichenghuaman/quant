/**
 * ModuleCard - 学习模块卡片
 *
 * 参考 Voxyz Pack 卡片设计：
 * 图表预览占位 + 名称 + 描述 + 标签 + 状态标记。
 * 整张卡片可点击。当前使用静态 mock 数据。
 */

import Link from "next/link";

type ModuleStatus = "completed" | "in-progress" | "not-started";

interface ModuleData {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  status: ModuleStatus;
}

const statusConfig: Record<ModuleStatus, { label: string; dot: string; text: string }> = {
  completed: { label: "已完成", dot: "bg-accent-green", text: "text-accent-green" },
  "in-progress": { label: "进行中", dot: "bg-accent-yellow", text: "text-accent-yellow" },
  "not-started": { label: "未开始", dot: "bg-muted/40", text: "text-muted" },
};

const mockModules: ModuleData[] = [
  {
    slug: "moving-average",
    name: "均线策略入门",
    description: "从最简单的移动平均线开始，理解金叉死叉信号的原理与局限。",
    tags: ["基础", "指标"],
    status: "completed",
  },
  {
    slug: "macd-strategy",
    name: "MACD 策略研究",
    description: "深入 MACD 指标的构成，研究 DIF/DEA/柱状图的含义，设计交叉策略。",
    tags: ["指标", "策略"],
    status: "completed",
  },
  {
    slug: "rsi-overbought",
    name: "RSI 超买超卖",
    description: "学习 RSI 指标的计算方法，探索超买超卖区域的交易信号。",
    tags: ["指标", "基础"],
    status: "in-progress",
  },
  {
    slug: "backtest-framework",
    name: "回测框架搭建",
    description: "搭建本地回测环境，理解回测的基本流程：数据加载、信号生成、绩效评估。",
    tags: ["回测", "工程"],
    status: "in-progress",
  },
  {
    slug: "risk-management",
    name: "风控基础概念",
    description: "了解仓位管理、止损策略、最大回撤等风控核心概念。",
    tags: ["风控", "基础"],
    status: "not-started",
  },
];

function StatusBadge({ status }: { status: ModuleStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function ModuleCardGrid() {
  return (
    <section className="py-12">
      <h2
        className="mb-8 text-center text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        最新学习模块
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockModules.map((mod) => (
          <Link
            key={mod.slug}
            href={`/learn/${mod.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-card-bg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Chart preview placeholder */}
            <div className="flex h-32 items-center justify-center rounded-t-xl bg-foreground/5 text-sm text-muted/50">
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              预览图
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
              {/* Name + Status */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground group-hover:text-accent-red transition-colors">
                  {mod.name}
                </h3>
                <StatusBadge status={mod.status} />
              </div>

              {/* Description */}
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
                {mod.description}
              </p>

              {/* Tags */}
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
          </Link>
        ))}
      </div>
    </section>
  );
}
