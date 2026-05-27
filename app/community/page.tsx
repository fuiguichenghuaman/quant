"use client";

import { useState } from "react";

/* ============================================
   Mock Data
   ============================================ */

const strategies = [
  { id: 1, name: "双均线交叉策略", author: "量化小白", description: "用 MA5 和 MA20 的交叉信号做简单趋势跟踪", likes: 24, favorites: 12, tags: ["均线", "入门"], time: "3天前" },
  { id: 2, name: "MACD 背离策略", author: "学习者A", description: "当价格创新高但 MACD 没有创新高时，可能有反转信号", likes: 18, favorites: 8, tags: ["MACD", "进阶"], time: "1周前" },
  { id: 3, name: "KDJ 超买超卖", author: "QLab 学习者", description: "利用 KDJ 的 J 值判断超买超卖区域", likes: 31, favorites: 15, tags: ["KDJ", "反转"], time: "2周前" },
  { id: 4, name: "布林带突破策略", author: "学习者B", description: "当价格突破布林带上轨时买入，跌破下轨时卖出", likes: 15, favorites: 6, tags: ["布林带", "突破"], time: "2周前" },
  { id: 5, name: "RSI 均值回归", author: "量化新手", description: "RSI 低于 30 买入，高于 70 卖出", likes: 22, favorites: 10, tags: ["RSI", "均值回归"], time: "3周前" },
  { id: 6, name: "成交量加权策略", author: "学习者C", description: "结合成交量变化判断趋势强度", likes: 12, favorites: 5, tags: ["成交量", "趋势"], time: "1个月前" },
];

const discussions = [
  { id: 1, title: "MA 均线参数怎么选比较好？", author: "新手提问", time: "2小时前", replies: 8, category: "问答" },
  { id: 2, title: "分享我的第一个回测结果", author: "学习者A", time: "5小时前", replies: 12, category: "分享" },
  { id: 3, title: "聚宽平台的手续费设置问题", author: "求助者", time: "1天前", replies: 5, category: "求助" },
  { id: 4, title: "MACD 和 KDJ 哪个更适合 A 股？", author: "讨论发起者", time: "2天前", replies: 15, category: "讨论" },
  { id: 5, title: "如何避免回测中的未来函数？", author: "学习者B", time: "3天前", replies: 9, category: "问答" },
];

const learningPaths: {
  id: string;
  name: string;
  modules: number;
  duration: string;
  description: string;
  color: PathColor;
  steps: { name: string; desc: string }[];
}[] = [
  {
    id: "beginner",
    name: "入门路线",
    modules: 4,
    duration: "2-3 周",
    description: "从零开始，掌握量化学习的基础工具和最常用的技术指标。",
    color: "accent-green",
    steps: [
      { name: "NumPy 基础", desc: "数值计算入门，数组操作与向量化运算" },
      { name: "Pandas 数据处理", desc: "DataFrame 操作，金融数据清洗与整理" },
      { name: "K 线图可视化", desc: "用 matplotlib 绘制蜡烛图，理解价格走势" },
      { name: "MACD 指标", desc: "移动平均收敛散度，趋势跟踪的经典指标" },
    ],
  },
  {
    id: "intermediate",
    name: "进阶路线",
    modules: 4,
    duration: "3-4 周",
    description: "在掌握基础后，学习更多指标组合与策略回测方法。",
    color: "accent-yellow",
    steps: [
      { name: "KDJ 指标", desc: "随机指标，判断超买超卖与短期反转" },
      { name: "综合指标分析", desc: "多指标共振，提高信号可靠性" },
      { name: "MA 策略实战", desc: "均线系统搭建，参数调优与组合" },
      { name: "回测框架", desc: "用 Python 搭建回测系统，验证策略有效性" },
    ],
  },
  {
    id: "advanced",
    name: "专家路线",
    modules: 3,
    duration: "4-6 周",
    description: "系统化量化研究方法，从择时到选股再到策略优化。",
    color: "accent-red",
    steps: [
      { name: "量化择时", desc: "基于技术面与资金面的择时模型构建" },
      { name: "量化选股", desc: "多因子选股模型，因子挖掘与评价" },
      { name: "策略优化", desc: "参数稳健性检验，过拟合防范与组合优化" },
    ],
  },
];

type PathColor = "accent-green" | "accent-yellow" | "accent-red";

type TabKey = "strategies" | "discussions" | "paths";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "strategies", label: "策略分享", icon: "S" },
  { key: "discussions", label: "讨论区", icon: "D" },
  { key: "paths", label: "学习路线", icon: "L" },
];

/* ============================================
   Category Badge Color Map
   ============================================ */

function categoryColor(category: string): string {
  switch (category) {
    case "问答":
      return "bg-accent-green/15 text-accent-green";
    case "分享":
      return "bg-accent-yellow/15 text-foreground";
    case "求助":
      return "bg-accent-red/15 text-accent-red";
    case "讨论":
      return "bg-accent-green/15 text-foreground";
    default:
      return "bg-border text-muted";
  }
}

/* ============================================
   Page Component
   ============================================ */

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("strategies");

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Header */}
      <h1
        className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        学习社区
      </h1>
      <p className="mb-10 text-lg text-muted">
        策略分享、互助讨论、学习路线推荐 —— 一起进步
      </p>

      {/* Tab Bar */}
      <div className="mb-8 flex gap-2 rounded-xl border border-border bg-card-bg p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-accent-red text-white shadow-sm"
                : "text-muted hover:bg-background hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "strategies" && <StrategiesTab />}
      {activeTab === "discussions" && <DiscussionsTab />}
      {activeTab === "paths" && <PathsTab />}
    </div>
  );
}

/* ============================================
   Tab 1: Strategies
   ============================================ */

function StrategiesTab() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {strategies.map((s) => (
        <div
          key={s.id}
          className="card-glow group rounded-xl border border-border bg-card-bg p-5 transition-all hover:-translate-y-0.5"
        >
          {/* Title */}
          <h3
            className="mb-1.5 text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            {s.name}
          </h3>

          {/* Author & Time */}
          <div className="mb-3 flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-yellow/30 text-[10px] font-bold text-foreground">
              {s.author[0]}
            </span>
            <span>{s.author}</span>
            <span className="text-border">|</span>
            <span>{s.time}</span>
          </div>

          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-muted">
            {s.description}
          </p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {s.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-green/15 px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer: Likes & Favorites */}
          <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75m0 0A2.25 2.25 0 0115.75 6v0a2.25 2.25 0 01-2.25 2.25M15.75 3.75a2.25 2.25 0 012.25 2.25v0a2.25 2.25 0 01-2.25 2.25m-9.117 5.553a9.003 9.003 0 006.354 2.447m0 0a9.003 9.003 0 006.354-2.447M6.633 10.5A3.375 3.375 0 003 13.5v0a3.375 3.375 0 003.633 3.368M12 18a9.003 9.003 0 006.354-2.447" />
              </svg>
              {s.likes}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              {s.favorites}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   Tab 2: Discussions
   ============================================ */

function DiscussionsTab() {
  return (
    <div className="space-y-3">
      {discussions.map((d, index) => (
        <div
          key={d.id}
          className="card-glow group rounded-xl border border-border bg-card-bg p-5 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Content */}
            <div className="min-w-0 flex-1">
              {/* Title Row */}
              <div className="mb-2 flex items-center gap-3">
                <h3 className="truncate text-base font-bold text-foreground">
                  {d.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(d.category)}`}
                >
                  {d.category}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent-yellow/30 text-[9px] font-bold text-foreground">
                    {d.author[0]}
                  </span>
                  {d.author}
                </span>
                <span className="text-border">|</span>
                <span>{d.time}</span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  {d.replies} 回复
                </span>
              </div>
            </div>

            {/* Right: Post number */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-green/10 text-xs font-bold text-accent-green">
              #{index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   Path Color Helpers (full class strings for Tailwind)
   ============================================ */

function pathDotBg(color: PathColor): string {
  switch (color) {
    case "accent-green":
      return "bg-accent-green";
    case "accent-yellow":
      return "bg-accent-yellow";
    case "accent-red":
      return "bg-accent-red";
  }
}

function pathBorderColor(color: PathColor): string {
  switch (color) {
    case "accent-green":
      return "border-accent-green";
    case "accent-yellow":
      return "border-accent-yellow";
    case "accent-red":
      return "border-accent-red";
  }
}

/* ============================================
   Tab 3: Learning Paths
   ============================================ */

function PathsTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {learningPaths.map((path) => (
        <div
          key={path.id}
          className="card-glow rounded-xl border border-border bg-card-bg p-6 transition-all hover:-translate-y-0.5"
        >
          {/* Header */}
          <div className="mb-4">
            <div className="mb-1 flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${pathDotBg(path.color)}`} />
              <h3
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "var(--font-patrick-hand)" }}
              >
                {path.name}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">{path.description}</p>
          </div>

          {/* Stats */}
          <div className="mb-5 flex items-center gap-4 rounded-lg bg-background px-4 py-3 text-xs">
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span className="text-muted">{path.modules} 个模块</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-muted">{path.duration}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {path.steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Timeline line */}
                {idx < path.steps.length - 1 && (
                  <div className="absolute left-[7px] top-5 h-full w-px bg-border" />
                )}
                {/* Dot */}
                <div className={`relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${pathBorderColor(path.color)} bg-card-bg`}>
                  <div className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${pathDotBg(path.color)}`} />
                </div>
                {/* Content */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{step.name}</p>
                  <p className="text-xs leading-relaxed text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
