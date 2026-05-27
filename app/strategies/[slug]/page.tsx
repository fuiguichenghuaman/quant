/**
 * 策略详情页 - /strategies/[slug]
 *
 * 展示单个策略的完整档案，包含：
 * - 策略名称和描述
 * - 策略逻辑（通俗语言）
 * - 指标公式（代码块）
 * - 参数说明（表格）
 * - 风险提示
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  strategies,
  statusConfig,
  getStrategyBySlug,
} from "@/data/strategies";
import type { Strategy } from "@/data/strategies";

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
            <code className="text-sm leading-relaxed text-foreground/80">
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
                  回测结果基于历史数据，反映了策略在特定条件下的表现。
                </li>
                <li>
                  <span className="mr-1.5 text-accent-red">*</span>
                  真实交易涉及手续费、滑点、流动性等因素，可能与回测结果存在差异。
                </li>
                <li>
                  <span className="mr-1.5 text-accent-red">*</span>
                  策略研究应结合自身情况，理性分析。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 说明 ===== */}
      <section className="border-t border-border pt-8">
        <div className="rounded-lg bg-foreground/[0.02] px-6 py-5">
          <p className="text-center text-sm leading-relaxed text-muted">
            本策略为个人学习研究记录，回测结果基于历史数据，反映了策略在特定条件下的表现。
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
