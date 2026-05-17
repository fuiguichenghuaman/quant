/**
 * ModuleCard - 学习模块卡片
 *
 * 参考 Voxyz Pack 卡片设计：
 * SVG 图表预览 + 名称 + 描述 + 标签 + 状态标记。
 * 整张卡片可点击。
 */

import Link from "next/link";

type ModuleStatus = "completed" | "in-progress" | "not-started";

interface ModuleData {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  status: ModuleStatus;
  chartType: "bar" | "line" | "candle" | "area";
}

const statusConfig: Record<ModuleStatus, { label: string; dot: string; text: string }> = {
  completed: { label: "已完成", dot: "bg-accent-green", text: "text-accent-green" },
  "in-progress": { label: "进行中", dot: "bg-accent-yellow", text: "text-accent-yellow" },
  "not-started": { label: "未开始", dot: "bg-muted/40", text: "text-muted" },
};

const modules: ModuleData[] = [
  {
    slug: "01-numpy-basics",
    name: "NumPy 股票数据基础",
    description: "用 NumPy 读取 CSV 数据，计算统计指标（均值、方差、极差），理解 SMA 和 EMA 均线。",
    tags: ["基础", "NumPy"],
    status: "completed",
    chartType: "bar",
  },
  {
    slug: "02-kline-visualization",
    name: "K 线图可视化",
    description: "用 Pandas + mplfinance 画 K 线图，叠加成交量和均线，理解价格结构。",
    tags: ["可视化", "K线"],
    status: "completed",
    chartType: "candle",
  },
  {
    slug: "03-macd-indicator",
    name: "MACD 指标研究",
    description: "深入 MACD 指标构成：DIF、DEA、柱状图，用 matplotlib 绘制完整 MACD 图。",
    tags: ["指标", "可视化"],
    status: "completed",
    chartType: "line",
  },
];

/* SVG chart preview illustrations */
function ChartPreview({ type }: { type: ModuleData["chartType"] }) {
  if (type === "bar") {
    return (
      <svg className="h-full w-full" viewBox="0 0 200 80" fill="none">
        <rect x="10" y="50" width="16" height="30" rx="2" fill="#E84B3A" opacity="0.8" />
        <rect x="32" y="35" width="16" height="45" rx="2" fill="#7DD3C0" opacity="0.8" />
        <rect x="54" y="20" width="16" height="60" rx="2" fill="#E84B3A" opacity="0.8" />
        <rect x="76" y="40" width="16" height="40" rx="2" fill="#7DD3C0" opacity="0.8" />
        <rect x="98" y="25" width="16" height="55" rx="2" fill="#E84B3A" opacity="0.8" />
        <rect x="120" y="45" width="16" height="35" rx="2" fill="#7DD3C0" opacity="0.8" />
        <rect x="142" y="15" width="16" height="65" rx="2" fill="#E84B3A" opacity="0.8" />
        <rect x="164" y="30" width="16" height="50" rx="2" fill="#7DD3C0" opacity="0.8" />
      </svg>
    );
  }
  if (type === "candle") {
    return (
      <svg className="h-full w-full" viewBox="0 0 200 80" fill="none">
        {/* Candlesticks */}
        <line x1="20" y1="10" x2="20" y2="70" stroke="#E84B3A" strokeWidth="1" />
        <rect x="15" y="25" width="10" height="30" rx="1" fill="#E84B3A" />
        <line x1="45" y1="15" x2="45" y2="65" stroke="#4CAF50" strokeWidth="1" />
        <rect x="40" y="30" width="10" height="25" rx="1" fill="#4CAF50" />
        <line x1="70" y1="5" x2="70" y2="55" stroke="#E84B3A" strokeWidth="1" />
        <rect x="65" y="15" width="10" height="25" rx="1" fill="#E84B3A" />
        <line x1="95" y1="20" x2="95" y2="70" stroke="#4CAF50" strokeWidth="1" />
        <rect x="90" y="35" width="10" height="20" rx="1" fill="#4CAF50" />
        <line x1="120" y1="8" x2="120" y2="60" stroke="#E84B3A" strokeWidth="1" />
        <rect x="115" y="20" width="10" height="25" rx="1" fill="#E84B3A" />
        <line x1="145" y1="12" x2="145" y2="58" stroke="#E84B3A" strokeWidth="1" />
        <rect x="140" y="22" width="10" height="20" rx="1" fill="#E84B3A" />
        <line x1="170" y1="18" x2="170" y2="68" stroke="#4CAF50" strokeWidth="1" />
        <rect x="165" y="32" width="10" height="22" rx="1" fill="#4CAF50" />
      </svg>
    );
  }
  if (type === "line") {
    return (
      <svg className="h-full w-full" viewBox="0 0 200 80" fill="none">
        {/* MACD-like lines */}
        <polyline points="0,50 20,45 40,48 60,35 80,40 100,25 120,30 140,20 160,28 180,15 200,22"
          stroke="#E84B3A" strokeWidth="2" fill="none" />
        <polyline points="0,55 20,52 40,54 60,42 80,45 100,35 120,38 140,30 160,35 180,25 200,30"
          stroke="#7DD3C0" strokeWidth="2" fill="none" />
        {/* Zero line */}
        <line x1="0" y1="50" x2="200" y2="50" stroke="#E5E2DC" strokeWidth="0.5" strokeDasharray="4" />
        {/* Bar histogram */}
        <rect x="58" y="42" width="6" height="8" fill="#7DD3C0" opacity="0.5" />
        <rect x="78" y="40" width="6" height="10" fill="#7DD3C0" opacity="0.5" />
        <rect x="98" y="35" width="6" height="15" fill="#E84B3A" opacity="0.5" />
        <rect x="118" y="32" width="6" height="18" fill="#E84B3A" opacity="0.5" />
        <rect x="138" y="28" width="6" height="22" fill="#E84B3A" opacity="0.5" />
        <rect x="158" y="25" width="6" height="25" fill="#E84B3A" opacity="0.5" />
      </svg>
    );
  }
  // area
  return (
    <svg className="h-full w-full" viewBox="0 0 200 80" fill="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E84B3A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E84B3A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,60 Q30,50 50,40 T100,30 T150,20 T200,25 V80 H0 Z" fill="url(#areaGrad)" />
      <path d="M0,60 Q30,50 50,40 T100,30 T150,20 T200,25" stroke="#E84B3A" strokeWidth="2" fill="none" />
    </svg>
  );
}

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
        className="mb-2 text-center text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        学习模块
      </h2>
      <p className="mb-8 text-center text-sm text-muted">
        每个模块包含代码、讲解、笔记、输出、README 五件套
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.slug}
            href={`/learn/${mod.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card-bg shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
          >
            {/* Chart preview illustration */}
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.08] px-6 py-4">
              <ChartPreview type={mod.chartType} />
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
