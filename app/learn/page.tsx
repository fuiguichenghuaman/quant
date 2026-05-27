"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import bookData from "@/data/book.json";

/* ---- Types ---- */

interface BookSection {
  id: string;
  title: string;
  content: string;
}

interface BookChapter {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "theory" | "code";
  modules?: string[];
  directory?: string;
  sections: BookSection[];
}

interface BookInfo {
  title: string;
  subtitle: string;
  chapters: BookChapter[];
}

/* ---- Module metadata (for code chapters) ---- */

const moduleMeta: Record<
  string,
  { title: string; description: string; tags: string[]; platform: "local" | "jq" }
> = {
  "01-numpy-basics": { title: "NumPy 股票数据基础", description: "用 NumPy 读取股票 CSV 数据，计算最大值、最小值、均值、方差、SMA、EMA 等基础指标。", tags: ["基础", "NumPy"], platform: "local" },
  "02-kline-visualization": { title: "K 线图可视化", description: "用 matplotlib 和 mplfinance 绘制 K 线图，叠加成交量和均线。", tags: ["基础", "可视化"], platform: "local" },
  "03-macd-indicator": { title: "MACD 指标", description: "计算 MACD 指标（DIF、DEA、BAR），画出红绿柱状图。", tags: ["指标", "策略"], platform: "local" },
  "04-pandas-basics": { title: "Pandas 股票数据基础", description: "用 pandas 读取 CSV 数据，掌握 DataFrame 操作。", tags: ["基础", "Pandas"], platform: "local" },
  "05-kdj-indicator": { title: "KDJ 指标", description: "计算 KDJ 指标（K、D、J 三线），理解 rolling 窗口。", tags: ["指标", "可视化"], platform: "local" },
  "06-all-indicators": { title: "综合技术指标图", description: "把 K 线、均线、成交量、MACD、KDJ 整合到一张图里。", tags: ["综合", "可视化"], platform: "local" },
  "07-ma-crossover-strategy": { title: "MA 均线交叉策略", description: "最简单的均线交叉策略：MA5 作为买入/卖出信号。", tags: ["策略", "均线"], platform: "jq" },
  "08-portfolio-context": { title: "账户结构与持仓检查", description: "深入了解 context.portfolio 结构、持仓对象属性。", tags: ["聚宽", "API"], platform: "jq" },
  "09-order-cost-slippage": { title: "交易成本与滑点设置", description: "配置 set_order_cost、set_slippage、set_option。", tags: ["回测", "聚宽"], platform: "jq" },
  "10-backtest-reproducibility": { title: "回测可复现性", description: "为什么不同人的回测结果不同？如何让回测可复现？", tags: ["回测", "方法论"], platform: "jq" },
  "01-double-ma-strategy": { title: "双均线策略", description: "金叉买入、死叉卖出，最经典的量化入门策略。", tags: ["策略", "均线"], platform: "jq" },
  "02-kdj-strategy": { title: "KDJ 策略", description: "用 KDJ 超买超卖指标自动买卖。", tags: ["策略", "KDJ"], platform: "jq" },
  "03-ma-rsi-strategy": { title: "MA-RSI 策略", description: "MA200 + RSI10 组合选股。", tags: ["选股", "RSI"], platform: "jq" },
  "04-energy-indicator-strategy": { title: "能量型指标策略", description: "用 BRAR、CR、VR 三个能量型指标判断买卖时机。", tags: ["指标", "BRAR"], platform: "jq" },
  "05-boll-strategy": { title: "布林带策略", description: "布林带通道突破策略。", tags: ["策略", "布林带"], platform: "jq" },
  "06-new-energy-rotation": { title: "新能源轮动策略", description: "在新能源行业里选出 PB 最低的股票持有。", tags: ["轮动", "选股"], platform: "jq" },
  "07-low-valuation-strategy": { title: "低估值量化策略", description: "低 PB + 低负债 + 高流动性，每月调仓。", tags: ["价值", "选股"], platform: "jq" },
  "08-size-rotation-strategy": { title: "大小盘轮动策略", description: "HP 滤波 + 四象限法，大盘小盘轮动。", tags: ["轮动", "ETF"], platform: "jq" },
};

const platformInfo: Record<string, { label: string; color: string; icon: string }> = {
  local: { label: "本地运行", color: "bg-accent-green/15 text-accent-green", icon: "💻" },
  jq: { label: "聚宽平台", color: "bg-accent-red/15 text-accent-red", icon: "☁️" },
};

/* ---- Directory modules (for chapters that use directory-based code) ---- */

const directoryModules: Record<string, { slug: string; title: string; description: string }[]> = {
  "3_stock_量化选股": [
    { slug: "quant-sel-1", title: "量化选股基础", description: "用财务指标（PE、PB、ROE）筛选股票" },
    { slug: "quant-sel-2", title: "多因子选股", description: "多个因子综合打分选股" },
    { slug: "quant-sel-3", title: "成长性选股", description: "基于盈利增速和成长性选股" },
    { slug: "quant-sel-4", title: "价值型选股", description: "基于估值指标选股" },
    { slug: "quant-sel-5", title: "动量选股", description: "基于价格动量选股" },
    { slug: "quant-sel-6", title: "综合选股策略", description: "多种方法组合的综合选股" },
  ],
  "4_stock_量化择时": [
    { slug: "quant-time-1", title: "趋势指标（上）", description: "均线、MACD 等趋势跟踪指标" },
    { slug: "quant-time-2", title: "趋势指标（中）", description: "更多趋势指标的应用" },
    { slug: "quant-time-3", title: "趋势指标（下）", description: "趋势指标的组合使用" },
    { slug: "quant-time-4", title: "反趋势指标", description: "KDJ、RSI 等反转指标" },
    { slug: "quant-time-5", title: "压力支撑指标", description: "布林带、通道类指标" },
    { slug: "quant-time-6", title: "量价指标", description: "成交量与价格的关系" },
  ],
  "5_stock_策略回测实现": [
    { slug: "backtest-macd", title: "MACD 策略回测", description: "用 MACD 指标实现完整策略回测" },
  ],
};

/* ---- Chapter color scheme ---- */

const chapterColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  theory: { bg: "bg-accent-yellow/10", text: "text-foreground", border: "border-accent-yellow/30", badge: "bg-accent-yellow/20 text-foreground/70" },
  code: { bg: "bg-accent-green/10", text: "text-foreground", border: "border-accent-green/30", badge: "bg-accent-green/20 text-accent-green" },
};

/* ---- Simple Markdown renderer ---- */

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={key++} className="my-3 overflow-x-auto rounded-lg bg-code-bg p-4">
            <code className="text-sm leading-relaxed text-white/90 font-mono">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) { codeLines.push(line); continue; }
    if (line.trim() === "") { elements.push(<div key={key++} className="h-2" />); continue; }

    // Table
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].includes("|") && lines[j].trim().startsWith("|")) {
        tableLines.push(lines[j]); j++;
      }
      i = j - 1;
      const rows = tableLines.filter((l) => !l.match(/^\|[\s-|]+\|$/)).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
      if (rows.length > 0) {
        elements.push(
          <div key={key++} className="my-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">{rows[0].map((cell, ci) => <th key={ci} className="px-3 py-2 text-left font-semibold text-foreground">{cell}</th>)}</tr></thead>
              <tbody>{rows.slice(1).map((row, ri) => <tr key={ri} className="border-b border-border/50">{row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-muted">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Lists
    if (line.trim().startsWith("- ")) {
      const listItems: string[] = [line.trim().slice(2)];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith("- ")) { listItems.push(lines[j].trim().slice(2)); j++; }
      i = j - 1;
      elements.push(
        <ul key={key++} className="my-2 list-disc pl-6 text-sm leading-relaxed text-muted">
          {listItems.map((item, li) => <li key={li} className="mb-1">{renderInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (line.trim().match(/^\d+\.\s/)) {
      const listItems: string[] = [line.trim().replace(/^\d+\.\s/, "")];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().match(/^\d+\.\s/)) { listItems.push(lines[j].trim().replace(/^\d+\.\s/, "")); j++; }
      i = j - 1;
      elements.push(
        <ol key={key++} className="my-2 list-decimal pl-6 text-sm leading-relaxed text-muted">
          {listItems.map((item, li) => <li key={li} className="mb-1">{renderInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Heading
    if (line.startsWith("### ")) { elements.push(<h3 key={key++} className="mb-2 mt-5 text-base font-semibold text-foreground">{line.slice(4)}</h3>); continue; }
    if (line.startsWith("## ")) { elements.push(<h2 key={key++} className="mb-3 mt-6 text-lg font-bold text-foreground">{line.slice(3)}</h2>); continue; }

    elements.push(<p key={key++} className="my-1.5 text-sm leading-relaxed text-muted">{renderInline(line)}</p>);
  }

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)$/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(renderBold(codeMatch[1], partKey++));
      parts.push(<code key={partKey++} className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90">{codeMatch[2]}</code>);
      remaining = codeMatch[3];
      continue;
    }
    parts.push(renderBold(remaining, partKey++));
    break;
  }
  return <>{parts}</>;
}

function renderBold(text: string, key: number): React.ReactNode {
  const boldParts: React.ReactNode[] = [];
  let remaining = text;
  let bKey = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*([\s\S]*)$/);
    if (boldMatch) {
      if (boldMatch[1]) boldParts.push(boldMatch[1]);
      boldParts.push(<strong key={bKey++} className="font-semibold text-foreground">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }
    boldParts.push(remaining);
    break;
  }
  return <span key={key}>{boldParts}</span>;
}

/* ---- Sidebar ---- */

function Sidebar({
  data,
  activeChapter,
  onChapterClick,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  data: BookInfo;
  activeChapter: string;
  onChapterClick: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.chapters.forEach((c) => (init[c.id] = true));
    return init;
  });

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Collapsed sidebar (desktop only)
  const collapsedSidebar = (
    <nav className="hidden h-full flex-col items-center gap-1 py-4 md:flex">
      {data.chapters.map((chapter) => {
        const isActive = activeChapter === chapter.id;
        const colors = chapterColors[chapter.type];
        return (
          <button
            key={chapter.id}
            onClick={() => onChapterClick(chapter.id)}
            title={chapter.title}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
              isActive ? `${colors.badge} ring-1 ring-foreground/20` : "bg-foreground/5 text-muted/60 hover:bg-foreground/10"
            }`}
          >
            {chapter.number}
          </button>
        );
      })}
    </nav>
  );

  const sidebar = (
    <nav className="flex h-full flex-col">
      {/* Sidebar header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold text-foreground">目录</h2>
        <button onClick={onClose} className="rounded p-1 text-muted hover:text-foreground md:hidden">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {data.chapters.map((chapter) => {
          const isActive = activeChapter === chapter.id;
          const isExpanded = expanded[chapter.id];
          const colors = chapterColors[chapter.type];

          return (
            <div key={chapter.id} className="mb-1">
              <button
                onClick={() => {
                  toggle(chapter.id);
                  onChapterClick(chapter.id);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive ? "bg-foreground/5 text-foreground font-medium" : "text-muted hover:text-foreground hover:bg-foreground/[0.03]"
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${colors.badge}`}>
                  {chapter.number}
                </span>
                <span className="flex-1 truncate">{chapter.title}</span>
                <svg
                  className={`h-3.5 w-3.5 shrink-0 text-muted/50 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {isExpanded && (
                <div className="ml-5 mt-0.5 border-l border-border/50 pl-3">
                  {chapter.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        const el = document.getElementById(`section-${section.id}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        onClose();
                      }}
                      className="block w-full truncate py-1.5 text-left text-xs text-muted transition-colors hover:text-accent-red"
                    >
                      {section.title}
                    </button>
                  ))}
                  {chapter.modules && chapter.modules.length > 0 && (
                    <button
                      onClick={() => {
                        const el = document.getElementById(`chapter-${chapter.id}-modules`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        onClose();
                      }}
                      className="block w-full truncate py-1.5 text-left text-xs text-accent-green/70 transition-colors hover:text-accent-red"
                    >
                      代码模块 ({chapter.modules.length})
                    </button>
                  )}
                  {chapter.directory && directoryModules[chapter.directory] && (
                    <button
                      onClick={() => {
                        const el = document.getElementById(`chapter-${chapter.id}-modules`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        onClose();
                      }}
                      className="block w-full truncate py-1.5 text-left text-xs text-accent-green/70 transition-colors hover:text-accent-red"
                    >
                      代码模块 ({directoryModules[chapter.directory].length})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar footer */}
      <div className="border-t border-border px-5 py-3">
        <Link href="/roadmap/edit" className="flex items-center gap-1.5 text-[11px] text-muted/40 transition-colors hover:text-accent-red">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          编辑路线图
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 z-50 h-full border-r border-border bg-card-bg transition-all duration-200 md:sticky md:top-16 md:z-0 md:h-[calc(100vh-4rem)] ${
          isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"
        } ${collapsed ? "md:w-14 md:translate-x-0" : "md:w-72 md:translate-x-0"}`}
      >
        <div className="h-full md:hidden">{sidebar}</div>
        <div className="hidden h-full md:block">{collapsed ? collapsedSidebar : sidebar}</div>

        {/* Toggle button on right edge */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-1/2 -right-3 z-50 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card-bg text-muted/60 shadow-sm transition-colors hover:text-foreground md:flex"
          title={collapsed ? "展开目录" : "收起目录"}
        >
          <svg className={`h-3 w-3 transition-transform ${collapsed ? "rotate-0" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </aside>
    </>
  );
}

/* ---- Section content (expandable) ---- */

function SectionCard({ section }: { section: BookSection }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div id={`section-${section.id}`} className="scroll-mt-20 rounded-lg border border-border/50 bg-card-bg">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02]"
      >
        <svg
          className={`h-4 w-4 shrink-0 text-muted/50 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
      </button>
      {expanded && (
        <div className="border-t border-border/30 px-5 py-4">
          {renderMarkdown(section.content)}
        </div>
      )}
    </div>
  );
}

/* ---- Module card for code chapters ---- */

function ModuleCard({ slug }: { slug: string }) {
  const meta = moduleMeta[slug];
  if (!meta) return null;
  const plat = platformInfo[meta.platform];

  return (
    <Link
      href={`/learn/${slug}`}
      className="group flex items-start gap-4 rounded-lg border border-border bg-card-bg p-4 transition-all hover:shadow-sm hover:border-foreground/15"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted/40">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-accent-red">{meta.title}</h3>
          <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${plat.color}`}>{plat.icon} {plat.label}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{meta.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {meta.tags.map((tag) => <span key={tag} className="rounded-full bg-accent-yellow/15 px-2 py-0.5 text-[10px] text-foreground/60">{tag}</span>)}
        </div>
      </div>
      <svg className="mt-1 h-4 w-4 shrink-0 text-muted/30 transition-colors group-hover:text-accent-red" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

/* ---- Directory module card (for chapters 6-8) ---- */

function DirectoryModuleCard({ module }: { module: { slug: string; title: string; description: string } }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-card-bg p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-green/10 text-accent-green/60">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-foreground">{module.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">{module.description}</p>
      </div>
    </div>
  );
}

/* ---- Chapter Section ---- */

function ChapterSection({ chapter }: { chapter: BookChapter }) {
  const colors = chapterColors[chapter.type];
  const dirModules = chapter.directory ? directoryModules[chapter.directory] : null;

  return (
    <section id={`chapter-${chapter.id}`} className="scroll-mt-20">
      {/* Chapter header */}
      <div className="mb-5 flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${colors.badge}`}>
          {chapter.number}
        </span>
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-patrick-hand)" }}>{chapter.title}</h2>
          <p className="text-sm text-muted">{chapter.description}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="mb-6 space-y-3">
        {chapter.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Module cards (for chapter 4 - uses moduleMeta) */}
      {chapter.modules && chapter.modules.length > 0 && (
        <div id={`chapter-${chapter.id}-modules`} className="scroll-mt-20">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">代码模块</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {chapter.modules.map((slug) => <ModuleCard key={slug} slug={slug} />)}
          </div>
        </div>
      )}

      {/* Directory modules (for chapters 6-9) */}
      {dirModules && (
        <div id={`chapter-${chapter.id}-modules`} className="scroll-mt-20">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">代码模块</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {dirModules.map((m) => <DirectoryModuleCard key={m.slug} module={m} />)}
          </div>
          <p className="mt-3 text-xs text-muted/60">代码在聚宽量化平台上运行，后续会补充完整代码和讲解。</p>
        </div>
      )}
    </section>
  );
}

/* ---- Setup Tutorial (for chapter 1 - environment setup) ---- */

function SetupTutorial() {
  const [activeTab, setActiveTab] = useState("python");

  const tabs = [
    { id: "python", label: "安装 Python", icon: "🐍" },
    { id: "vscode", label: "安装 VS Code", icon: "📝" },
    { id: "pip", label: "安装 Python 库", icon: "📦" },
    { id: "jq", label: "注册聚宽", icon: "☁️" },
  ];

  return (
    <div className="mt-4 rounded-lg border border-border/50 bg-card-bg p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">环境搭建教程</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeTab === tab.id ? "bg-accent-red text-white shadow-sm" : "border border-border bg-card-bg text-foreground hover:border-foreground/20"}`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      {activeTab === "python" && (
        <div className="space-y-3 text-sm text-muted">
          <p>1. 访问 <a href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer" className="text-accent-red hover:underline">python.org/downloads</a>，下载 Python 3.10+</p>
          <p>2. 安装时 <strong className="text-foreground">一定要勾选 "Add python.exe to PATH"</strong></p>
          <p>3. 验证安装：<code className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90">python --version</code></p>
        </div>
      )}
      {activeTab === "vscode" && (
        <div className="space-y-3 text-sm text-muted">
          <p>1. 访问 <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" className="text-accent-red hover:underline">code.visualstudio.com</a>，下载 VS Code</p>
          <p>2. 安装后，搜索并安装 <strong className="text-foreground">Python 扩展</strong>（Microsoft 出品）</p>
          <p>3. 创建 <code className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90">hello.py</code>，输入 <code className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90">print("Hello")</code>，按 F5 运行</p>
        </div>
      )}
      {activeTab === "pip" && (
        <div className="space-y-3 text-sm text-muted">
          <p>打开命令提示符（Win+R → cmd → 回车），运行：</p>
          <pre className="overflow-x-auto rounded-lg bg-code-bg p-3"><code className="text-xs text-white/90">pip install numpy pandas matplotlib mplfinance</code></pre>
          <p>网络不好？用清华镜像：<code className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90">-i https://pypi.tuna.tsinghua.edu.cn/simple</code></p>
        </div>
      )}
      {activeTab === "jq" && (
        <div className="space-y-3 text-sm text-muted">
          <p>1. 访问 <a href="https://www.joinquant.com/" target="_blank" rel="noopener noreferrer" className="text-accent-red hover:underline">joinquant.com</a>，注册账号（免费版够用）</p>
          <p>2. 登录后点 "我的策略" → "新建策略"</p>
          <p>3. 聚宽自带 A 股数据和回测引擎，不需要自己下载数据</p>
        </div>
      )}
    </div>
  );
}

/* ---- Main Page ---- */

export default function LearnPage() {
  const data = bookData as BookInfo;
  const [activeChapter, setActiveChapter] = useState(data.chapters[0]?.id || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const activeChapterRef = useRef(activeChapter);

  // Keep ref in sync
  useEffect(() => {
    activeChapterRef.current = activeChapter;
  }, [activeChapter]);

  // Track which chapter is in viewport
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const handleScroll = () => {
      const sections = el.querySelectorAll("[id^='chapter-']");
      let current = activeChapterRef.current;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120) {
          current = section.id.replace("chapter-", "");
        }
      }
      if (current !== activeChapterRef.current) setActiveChapter(current);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToChapter(id: string) {
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        data={data}
        activeChapter={activeChapter}
        onChapterClick={scrollToChapter}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content */}
      <div ref={mainRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground md:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            目录
          </button>

          {/* Book header */}
          <header className="mb-10">
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-patrick-hand)" }}>
              {data.title}
            </h1>
            <p className="mb-4 max-w-2xl text-lg leading-relaxed text-muted">{data.subtitle}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-yellow/15 px-3 py-1 text-foreground/70">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                {data.chapters.length} 章
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/15 px-3 py-1 text-accent-green">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                37 个代码脚本
              </span>
              <a
                href="https://www.bilibili.com/video/BV1bXCTBGE42"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-red/10 px-3 py-1 text-accent-red transition-colors hover:bg-accent-red/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                配套视频教程
              </a>
            </div>
          </header>

          {/* Platform legend */}
          <div className="mb-8 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-accent-yellow" /> 理论知识</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-accent-green" /> 代码实战</span>
            <span className="flex items-center gap-1">💻 本地运行</span>
            <span className="flex items-center gap-1">☁️ 聚宽平台</span>
          </div>

          {/* Chapter list */}
          <div className="space-y-12">
            {data.chapters.map((chapter) => (
              <ChapterSection key={chapter.id} chapter={chapter} />
            ))}
          </div>

          {/* 说明 */}
          <section className="mt-16 border-t border-border pt-6">
            <p className="text-center text-xs leading-relaxed text-muted">
              本页面内容为个人学习记录，代码和数据用于教学演示。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
