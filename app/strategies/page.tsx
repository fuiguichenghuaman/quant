/**
 * 策略档案库 - 策略列表页
 *
 * 展示所有策略的卡片网格，每个卡片包含：
 * - 策略名称
 * - 一句话描述
 * - 标签
 * - 状态标记（已验证 / 研究中）
 * - SVG 图标
 */

import type { Metadata } from "next";
import Link from "next/link";
import { strategies, statusConfig } from "@/data/strategies";
import type { Strategy } from "@/data/strategies";

export const metadata: Metadata = {
  title: "策略档案",
  description: "量化学习策略研究档案库 —— 真实记录策略研发过程。",
};

/* ============================================
   SVG 图标组件
   ============================================ */

function StrategyIcon({ type }: { type: string }) {
  if (type === "趋势跟踪") {
    // 上升趋势线图标
    return (
      <svg
        className="h-10 w-10 text-accent-red/70"
        fill="none"
        viewBox="0 0 48 48"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 36L20 22L28 28L40 12"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M32 12H40V20"
        />
        <line x1="8" y1="40" x2="40" y2="40" strokeWidth={1} opacity={0.3} />
      </svg>
    );
  }

  // 反转策略图标
  return (
    <svg
      className="h-10 w-10 text-accent-green/70"
      fill="none"
      viewBox="0 0 48 48"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 36C14 36 18 12 24 12C30 12 34 36 40 36"
      />
      <circle cx="24" cy="12" r="3" fill="currentColor" opacity={0.3} />
      <line x1="8" y1="40" x2="40" y2="40" strokeWidth={1} opacity={0.3} />
    </svg>
  );
}

/* ============================================
   策略卡片组件
   ============================================ */

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const status = statusConfig[strategy.status];

  return (
    <Link
      href={`/strategies/${strategy.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card-bg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* 图标区域 */}
      <div className="flex h-32 items-center justify-center rounded-t-xl bg-foreground/[0.02]">
        <StrategyIcon type={strategy.type} />
      </div>

      {/* 内容区域 */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground group-hover:text-accent-red transition-colors">
            {strategy.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.text}
          </span>
        </div>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
          {strategy.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {strategy.tags.map((tag) => (
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
  );
}

/* ============================================
   页面组件
   ============================================ */

export default function StrategiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* 页面标题 */}
      <div className="mb-12">
        <h1
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          策略档案
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          记录每一个量化策略的研究过程，包括策略逻辑、指标公式、参数说明和回测分析。
        </p>
      </div>

      {/* 策略卡片网格 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.slug} strategy={strategy} />
        ))}
      </div>

      {/* 底部说明 */}
      <div className="mt-16 rounded-lg border border-border bg-foreground/[0.02] p-6">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground/80">
              关于策略档案
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              这些策略档案记录了个人量化学习过程中的策略研究。每个策略都包含完整的逻辑说明、指标公式和参数设置。
              回测结果基于历史数据，反映了策略在特定条件下的表现。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
