"use client";

/**
 * AI 辅助分析演示页面
 *
 * 展示平台 AI 投研功能的概念愿景。
 * 页面结构：
 * [Hero] -> [AI 分析师团队] -> [交互式分析演示] -> [愿景说明] -> [合规声明]
 *
 * 分析结果为预设 mock 数据，不调用任何真实 API。
 */

import { useState } from "react";

/* ============================================
   Mock 分析数据
   ============================================ */

interface Indicator {
  name: string;
  signal: string;
  strength: string;
}

interface AnalysisResult {
  name: string;
  technicalScore: number;
  trend: string;
  indicators: Indicator[];
  suggestion: string;
  risks: string[];
}

const mockAnalysis: Record<string, AnalysisResult> = {
  "000001": {
    name: "平安银行",
    technicalScore: 65,
    trend: "短期震荡偏强",
    indicators: [
      { name: "MACD", signal: "金叉", strength: "中" },
      { name: "KDJ", signal: "中性", strength: "弱" },
      { name: "MA", signal: "多头排列", strength: "强" },
      { name: "RSI", signal: "55.2", strength: "中" },
    ],
    suggestion:
      "技术面整体偏多，MACD 金叉确认，但 KDJ 尚未配合。短期关注 KDJ 是否跟随金叉，以及成交量是否放大确认。",
    risks: ["近期成交量未明显放大", "大盘环境偏弱", "需关注支撑位 15.50"],
  },
  "600519": {
    name: "贵州茅台",
    technicalScore: 72,
    trend: "中线上升趋势",
    indicators: [
      { name: "MACD", signal: "红柱扩大", strength: "强" },
      { name: "KDJ", signal: "超买区", strength: "弱" },
      { name: "MA", signal: "多头排列", strength: "强" },
      { name: "RSI", signal: "68.5", strength: "中" },
    ],
    suggestion:
      "中线趋势良好，但短期 KDJ 进入超买区，存在回调压力。需关注 RSI 是否突破 70 以及量能变化。",
    risks: ["KDJ 超买", "RSI 接近 70", "估值偏高"],
  },
};

/* ============================================
   AI 分析师角色数据
   ============================================ */

interface AnalystRole {
  title: string;
  abilities: string[];
  status: string;
  statusColor: string;
}

const analystRoles: AnalystRole[] = [
  {
    title: "技术面分析师",
    abilities: ["MACD", "KDJ", "均线分析", "形态识别"],
    status: "概念演示",
    statusColor: "bg-accent-green/10 text-accent-green",
  },
  {
    title: "基本面分析师",
    abilities: ["财务指标", "估值分析", "行业对比"],
    status: "规划中",
    statusColor: "bg-accent-yellow/10 text-foreground/70",
  },
  {
    title: "风险管理师",
    abilities: ["最大回撤", "波动率", "VaR", "仓位管理"],
    status: "概念演示",
    statusColor: "bg-accent-green/10 text-accent-green",
  },
  {
    title: "组合决策师",
    abilities: ["综合多维度分析", "生成研究结论"],
    status: "规划中",
    statusColor: "bg-accent-yellow/10 text-foreground/70",
  },
];

/* ============================================
   SVG 图标组件
   ============================================ */

/** 上升趋势线 - 技术面分析师 */
function TrendIcon() {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M32 12H40V20" />
      <line x1="8" y1="40" x2="40" y2="40" strokeWidth={1} opacity={0.3} />
    </svg>
  );
}

/** 文档/报表 - 基本面分析师 */
function DocumentIcon() {
  return (
    <svg
      className="h-10 w-10 text-accent-yellow/70"
      fill="none"
      viewBox="0 0 48 48"
      strokeWidth={2}
      stroke="currentColor"
    >
      <rect x="12" y="6" width="24" height="36" rx="2" />
      <path strokeLinecap="round" d="M18 16h12M18 22h12M18 28h8" />
      <line x1="18" y1="34" x2="26" y2="34" strokeWidth={1.5} opacity={0.4} />
    </svg>
  );
}

/** 盾牌 - 风险管理师 */
function ShieldIcon() {
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
        d="M24 6L8 14v12c0 10 7.2 19.4 16 22 8.8-2.6 16-12 16-22V14L24 6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 24l4 4 8-8"
        strokeWidth={2.5}
      />
    </svg>
  );
}

/** 流程图 - 组合决策师 */
function FlowChartIcon() {
  return (
    <svg
      className="h-10 w-10 text-foreground/50"
      fill="none"
      viewBox="0 0 48 48"
      strokeWidth={2}
      stroke="currentColor"
    >
      <rect x="16" y="6" width="16" height="10" rx="2" />
      <rect x="6" y="32" width="14" height="10" rx="2" />
      <rect x="28" y="32" width="14" height="10" rx="2" />
      <path strokeLinecap="round" d="M24 16v8m0 0l-10 8m10-8l10 8" />
    </svg>
  );
}

/** 根据角色索引返回对应图标 */
function AnalystIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <TrendIcon />;
    case 1:
      return <DocumentIcon />;
    case 2:
      return <ShieldIcon />;
    case 3:
      return <FlowChartIcon />;
    default:
      return null;
  }
}

/* ============================================
   进度条组件
   ============================================ */

function ScoreBar({ score }: { score: number }) {
  let barColor = "bg-accent-red";
  if (score >= 70) barColor = "bg-accent-green";
  else if (score >= 50) barColor = "bg-accent-yellow";

  return (
    <div className="flex items-center gap-4">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-lg font-bold text-foreground tabular-nums">
        {score}
        <span className="text-sm font-normal text-muted">/100</span>
      </span>
    </div>
  );
}

/* ============================================
   强度标签组件
   ============================================ */

function StrengthBadge({ strength }: { strength: string }) {
  let color = "bg-foreground/5 text-foreground/60";
  if (strength === "强") color = "bg-accent-green/15 text-accent-green";
  else if (strength === "中") color = "bg-accent-yellow/15 text-foreground/70";
  else if (strength === "弱") color = "bg-accent-red/10 text-accent-red";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {strength}
    </span>
  );
}

/* ============================================
   页面组件
   ============================================ */

export default function AIAnalysisPage() {
  const [stockCode, setStockCode] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function handleAnalyze() {
    const code = stockCode.trim();
    if (!code) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setNotFound(false);

    // 模拟分析延迟
    setTimeout(() => {
      const result = mockAnalysis[code];
      if (result) {
        setAnalysis(result);
        setNotFound(false);
      } else {
        setAnalysis(null);
        setNotFound(true);
      }
      setIsAnalyzing(false);
    }, 800);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* ===== Hero 区域 ===== */}
      <section className="mb-20 text-center">
        {/* 状态标记 */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-yellow/40 bg-accent-yellow/10 px-4 py-1.5 text-sm text-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent-yellow animate-pulse-soft" />
          概念演示
        </div>

        <h1
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          AI 辅助分析
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          多角色 AI 协作，让量化研究更高效
        </p>
        <p className="mx-auto max-w-xl text-sm text-foreground/50">
          这是平台的未来方向，当前为概念演示。分析结果基于预设数据，不代表真实投资价值判断。
        </p>
      </section>

      {/* ===== AI 分析师团队 ===== */}
      <section className="mb-20">
        <h2
          className="mb-2 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          AI 分析师团队
        </h2>
        <p className="mb-10 text-center text-sm text-muted">
          多角色协同，覆盖技术面、基本面、风险和决策全链路
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {analystRoles.map((role, index) => (
            <div
              key={role.title}
              className="group flex flex-col rounded-xl border border-border bg-card-bg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* 图标区域 */}
              <div className="flex h-28 items-center justify-center rounded-t-xl bg-foreground/[0.02]">
                <AnalystIcon index={index} />
              </div>

              {/* 内容区域 */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {role.title}
                  </h3>
                  <span
                    className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${role.statusColor}`}
                  >
                    {role.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {role.abilities.map((ability) => (
                    <span
                      key={ability}
                      className="rounded-full bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-muted"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== AI 分析演示区 ===== */}
      <section className="mb-20">
        <h2
          className="mb-2 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          分析演示
        </h2>
        <p className="mb-8 text-center text-sm text-muted">
          输入股票代码，体验 AI 分析报告（预设数据演示）
        </p>

        {/* 输入区域 */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="flex gap-3">
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入股票代码，如 000001"
              className="flex-1 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-red/40 focus:outline-none focus:ring-1 focus:ring-accent-red/20"
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !stockCode.trim()}
              className="rounded-lg bg-accent-red px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? "分析中..." : "开始分析"}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            支持的演示代码：000001（平安银行）、600519（贵州茅台）
          </p>
        </div>

        {/* 分析结果 */}
        {analysis && (
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card-bg shadow-sm">
            {/* 报告标题 */}
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-red/10 text-accent-red">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    AI 分析报告
                  </h3>
                  <p className="text-xs text-muted">
                    {stockCode.trim()} - {analysis.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* 技术面评分 */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  技术面评分
                </h4>
                <ScoreBar score={analysis.technicalScore} />
              </div>

              {/* 趋势判断 */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  趋势判断
                </h4>
                <div className="inline-flex items-center gap-2 rounded-lg bg-foreground/[0.03] px-4 py-2">
                  <svg
                    className="h-4 w-4 text-accent-red"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    {analysis.trend}
                  </span>
                </div>
              </div>

              {/* 关键指标摘要 */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-foreground">
                  关键指标摘要
                </h4>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-foreground/[0.02]">
                        <th className="px-4 py-2.5 text-left font-medium text-muted">
                          指标
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted">
                          信号
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted">
                          强度
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.indicators.map((ind, i) => (
                        <tr
                          key={ind.name}
                          className={
                            i < analysis.indicators.length - 1
                              ? "border-b border-border"
                              : ""
                          }
                        >
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {ind.name}
                          </td>
                          <td className="px-4 py-2.5 text-foreground/80">
                            {ind.signal}
                          </td>
                          <td className="px-4 py-2.5">
                            <StrengthBadge strength={ind.strength} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 技术分析 */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  技术分析
                </h4>
                <p className="rounded-lg bg-foreground/[0.02] px-4 py-3 text-sm leading-relaxed text-foreground/80">
                  {analysis.suggestion}
                </p>
              </div>

              {/* 风险提示 */}
              <div className="rounded-lg border border-accent-yellow/30 bg-accent-yellow/5 px-5 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-accent-yellow"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <h4 className="text-sm font-medium text-foreground">
                    风险提示
                  </h4>
                </div>
                <ul className="space-y-1">
                  {analysis.risks.map((risk) => (
                    <li
                      key={risk}
                      className="flex items-start gap-2 text-xs leading-relaxed text-foreground/70"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent-yellow" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 未找到提示 */}
        {notFound && (
          <div className="mx-auto max-w-md rounded-lg border border-border bg-card-bg p-6 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <p className="text-sm text-muted">
              未找到代码 &quot;{stockCode.trim()}&quot; 的演示数据
            </p>
            <p className="mt-1 text-xs text-muted/60">
              当前仅支持 000001（平安银行）和 600519（贵州茅台）的演示数据
            </p>
          </div>
        )}
      </section>

      {/* ===== 愿景说明 ===== */}
      <section className="mb-16">
        <h2
          className="mb-2 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          未来规划
        </h2>
        <p className="mb-10 text-center text-sm text-muted">
          AI 分析功能的演进路线
        </p>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          {/* 近期 */}
          <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-green" />
              <span className="text-xs font-medium text-accent-green">
                近期
              </span>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              基于技术指标的自动分析
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              实现 MACD、KDJ、RSI 等经典指标的自动计算和信号识别，生成结构化的技术面分析报告。
            </p>
          </div>

          {/* 中期 */}
          <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-yellow" />
              <span className="text-xs font-medium text-accent-yellow">
                中期
              </span>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              结合基本面的多维度分析
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              引入财务指标、估值模型和行业对比数据，与技术面形成交叉验证，提升分析的全面性。
            </p>
          </div>

          {/* 远期 */}
          <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-red" />
              <span className="text-xs font-medium text-accent-red">远期</span>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              多 Agent 协作的智能投研系统
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              多个 AI Agent 角色协同工作，覆盖技术面、基本面、风险管理等维度，形成完整的投研决策闭环。
            </p>
          </div>
        </div>
      </section>

      {/* ===== 说明 ===== */}
      <div className="rounded-lg border border-border bg-foreground/[0.02] px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          本页面为 AI 辅助分析的概念演示，分析结果基于预设 mock 数据，仅供学习参考。
        </p>
      </div>
    </div>
  );
}
