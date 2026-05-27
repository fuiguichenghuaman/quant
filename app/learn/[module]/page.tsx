/**
 * Module Detail Page - 学习模块详情页
 *
 * 动态路由：/learn/[module]
 * 从 content/ 目录读取模块五件套内容并展示。
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";

/* -------------------------------------------------------
   模块注册表（手动维护，后续可改为自动扫描）
   ------------------------------------------------------- */

interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

const MODULES: Record<string, ModuleMeta> = {
  "01-numpy-basics": {
    slug: "01-numpy-basics",
    title: "NumPy 股票数据基础",
    description:
      "用 NumPy 读取股票 CSV 数据，计算最大值、最小值、均值、方差、SMA、EMA 等基础指标。",
    tags: ["基础", "NumPy", "数据处理"],
    category: "01-stock-analysis",
  },
  "02-kline-visualization": {
    slug: "02-kline-visualization",
    title: "K 线图可视化",
    description:
      "用 matplotlib 和 mplfinance 绘制 K 线图，叠加成交量和均线，理解 A 股红涨绿跌配色。",
    tags: ["基础", "可视化", "mplfinance"],
    category: "01-stock-analysis",
  },
  "03-macd-indicator": {
    slug: "03-macd-indicator",
    title: "MACD 指标",
    description:
      "计算 MACD 指标（DIF、DEA、BAR），画出红绿柱状图，理解指数移动平均。",
    tags: ["指标", "策略", "EMA"],
    category: "01-stock-analysis",
  },
  "04-pandas-basics": {
    slug: "04-pandas-basics",
    title: "Pandas 股票数据基础",
    description:
      "用 pandas 读取 CSV 数据，掌握 DataFrame 操作：日期处理、分组统计、涨跌计算。",
    tags: ["基础", "Pandas", "数据处理"],
    category: "01-stock-analysis",
  },
  "05-kdj-indicator": {
    slug: "05-kdj-indicator",
    title: "KDJ 指标",
    description:
      "计算 KDJ 指标（K、D、J 三线），理解 rolling 窗口和 expanding 窗口，绘制 KDJ 图。",
    tags: ["指标", "可视化", "KDJ"],
    category: "01-stock-analysis",
  },
  "06-all-indicators": {
    slug: "06-all-indicators",
    title: "综合技术指标图",
    description:
      "把 K 线、均线、成交量、MACD、KDJ 整合到一张图里，四区域综合展示。",
    tags: ["综合", "可视化", "整合"],
    category: "01-stock-analysis",
  },
  "07-ma-crossover-strategy": {
    slug: "07-ma-crossover-strategy",
    title: "MA 均线交叉策略",
    description:
      "最简单的均线交叉策略：MA5 作为买入/卖出信号，理解量化交易的基本逻辑。",
    tags: ["策略", "均线", "聚宽"],
    category: "02-trading-strategy",
  },
  "08-portfolio-context": {
    slug: "08-portfolio-context",
    title: "账户结构与持仓检查",
    description:
      "深入了解 context.portfolio 结构、持仓对象属性、子账户信息，为策略开发打基础。",
    tags: ["聚宽", "API", "账户"],
    category: "02-trading-strategy",
  },
  "09-order-cost-slippage": {
    slug: "09-order-cost-slippage",
    title: "交易成本与滑点设置",
    description:
      "配置 set_order_cost、set_slippage、set_option，让回测更贴近真实交易。",
    tags: ["回测", "聚宽", "成本"],
    category: "02-trading-strategy",
  },
  "10-backtest-reproducibility": {
    slug: "10-backtest-reproducibility",
    title: "回测可复现性",
    description:
      "为什么不同人的回测结果不同？如何让回测可复现？聚宽策略框架总结。",
    tags: ["回测", "方法论", "聚宽"],
    category: "02-trading-strategy",
  },
  "01-double-ma-strategy": {
    slug: "01-double-ma-strategy",
    title: "双均线策略",
    description:
      "金叉买入、死叉卖出，最经典的量化入门策略。MA5 穿上 MA10 买，MA5 穿下 MA10 卖。",
    tags: ["策略", "均线", "入门"],
    category: "06-quant-practice",
  },
  "02-kdj-strategy": {
    slug: "02-kdj-strategy",
    title: "KDJ 策略",
    description:
      "用 KDJ 超买超卖指标自动买卖。K 在 20 附近金叉买，K 在 80 附近死叉卖。",
    tags: ["策略", "KDJ", "短线"],
    category: "06-quant-practice",
  },
  "03-ma-rsi-strategy": {
    slug: "03-ma-rsi-strategy",
    title: "MA-RSI 策略",
    description:
      "MA200 + RSI10 组合选股，从全 A 股里选出趋势向上且超卖的股票，按 RSI 排序买入。",
    tags: ["选股", "RSI", "组合"],
    category: "06-quant-practice",
  },
  "04-energy-indicator-strategy": {
    slug: "04-energy-indicator-strategy",
    title: "能量型指标策略",
    description:
      "用 BRAR、CR、VR 三个能量型指标判断买卖时机，衡量多空双方力量对比。",
    tags: ["指标", "BRAR", "能量"],
    category: "06-quant-practice",
  },
  "05-boll-strategy": {
    slug: "05-boll-strategy",
    title: "布林带策略",
    description:
      "布林带通道突破策略：价格跌破下轨买入，突破上轨卖出。适合震荡市。",
    tags: ["策略", "布林带", "通道"],
    category: "06-quant-practice",
  },
  "06-new-energy-rotation": {
    slug: "06-new-energy-rotation",
    title: "新能源轮动策略",
    description:
      "在新能源行业里选出市净率（PB）最低的股票持有，每周检查一次。",
    tags: ["轮动", "选股", "行业"],
    category: "06-quant-practice",
  },
  "07-low-valuation-strategy": {
    slug: "07-low-valuation-strategy",
    title: "低估值量化策略",
    description:
      "从沪深300里选低 PB、低负债、高流动性的股票，每月调仓，带大盘止损。",
    tags: ["价值", "选股", "止损"],
    category: "06-quant-practice",
  },
  "08-size-rotation-strategy": {
    slug: "08-size-rotation-strategy",
    title: "大小盘轮动策略",
    description:
      "用 HP 滤波和四象限法，在沪深300 ETF 和创业板 ETF 之间做轮动。",
    tags: ["轮动", "ETF", "高级"],
    category: "06-quant-practice",
  },
};

/* -------------------------------------------------------
   辅助函数：读取模块文件
   ------------------------------------------------------- */

function readModuleFile(category: string, slug: string, filename: string): string {
  const filePath = path.join(
    process.cwd(),
    "content",
    category,
    slug,
    filename
  );
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function readModuleFileLines(category: string, slug: string, filename: string): string[] {
  const content = readModuleFile(category, slug, filename);
  return content ? content.split("\n") : [];
}

/* -------------------------------------------------------
   简易 Markdown -> JSX 转换（不引入额外依赖）
   ------------------------------------------------------- */

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={key++} className="my-4 overflow-x-auto rounded-lg bg-code-bg p-4">
            <code className="text-sm leading-relaxed text-white/90 font-mono">
              {codeLines.join("\n")}
            </code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-3" />);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mb-2 mt-6 text-lg font-semibold text-foreground">
          {line.slice(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mb-3 mt-8 text-xl font-bold text-foreground">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="mb-4 mt-4 text-2xl font-bold text-foreground">
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="my-6 border-border" />);
      continue;
    }

    // Table (simple detection)
    if (line.includes("|") && line.trim().startsWith("|")) {
      // Collect all table lines
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].includes("|") && lines[j].trim().startsWith("|")) {
        tableLines.push(lines[j]);
        j++;
      }
      i = j - 1;

      // Parse table
      const rows = tableLines
        .filter((l) => !l.match(/^\|[\s-|]+\|$/)) // skip separator
        .map((l) =>
          l
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );

      if (rows.length > 0) {
        elements.push(
          <div key={key++} className="my-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {rows[0].map((cell, ci) => (
                    <th
                      key={ci}
                      className="px-3 py-2 text-left font-semibold text-foreground"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-muted">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Unordered list
    if (line.trim().startsWith("- ")) {
      const listItems: string[] = [line.trim().slice(2)];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith("- ")) {
        listItems.push(lines[j].trim().slice(2));
        j++;
      }
      i = j - 1;

      elements.push(
        <ul key={key++} className="my-2 list-disc pl-6 text-sm leading-relaxed text-muted">
          {listItems.map((item, li) => (
            <li key={li} className="mb-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.trim().match(/^\d+\.\s/)) {
      const listItems: string[] = [line.trim().replace(/^\d+\.\s/, "")];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().match(/^\d+\.\s/)) {
        listItems.push(lines[j].trim().replace(/^\d+\.\s/, ""));
        j++;
      }
      i = j - 1;

      elements.push(
        <ol key={key++} className="my-2 list-decimal pl-6 text-sm leading-relaxed text-muted">
          {listItems.map((item, li) => (
            <li key={li} className="mb-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="my-2 text-sm leading-relaxed text-muted">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  return <>{elements}</>;
}

/** Render inline markdown: bold, italic, code, links */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Simple approach: split by inline code backticks, bold **, etc.
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)$/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(renderBoldItalic(codeMatch[1], partKey++));
      parts.push(
        <code
          key={partKey++}
          className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90"
        >
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
      continue;
    }

    // No more inline formatting
    parts.push(renderBoldItalic(remaining, partKey++));
    break;
  }

  return <>{parts}</>;
}

function renderBoldItalic(text: string, key: number): React.ReactNode {
  // Bold **text**
  const boldParts: React.ReactNode[] = [];
  let remaining = text;
  let bKey = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*([\s\S]*)$/);
    if (boldMatch) {
      if (boldMatch[1]) boldParts.push(boldMatch[1]);
      boldParts.push(
        <strong key={bKey++} className="font-semibold text-foreground">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
      continue;
    }
    boldParts.push(remaining);
    break;
  }

  return <span key={key}>{boldParts}</span>;
}

/* -------------------------------------------------------
   Page Component
   ------------------------------------------------------- */

interface PageProps {
  params: Promise<{ module: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { module: moduleSlug } = await params;
  const meta = MODULES[moduleSlug];

  if (!meta) {
    notFound();
  }

  // Read content files
  const readmeContent = readModuleFile(meta.category, meta.slug, "README.md");
  const notesContent = readModuleFile(meta.category, meta.slug, "notes.md");
  const mainPyContent = readModuleFile(meta.category, meta.slug, "main.py");
  const explainedPyContent = readModuleFile(meta.category, meta.slug, "explained.py");

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted">
        <Link href="/learn" className="hover:text-accent-red transition-colors">
          学习路径
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{meta.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="mb-3 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs text-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          {meta.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted">{meta.description}</p>
      </header>

      {/* Module Overview (README) */}
      <section className="mb-12">
        <h2
          className="mb-4 text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          模块导读
        </h2>
        <div className="rounded-xl border border-border bg-card-bg p-6">
          {renderMarkdown(readmeContent)}
        </div>
      </section>

      {/* Main Script */}
      {mainPyContent && (
        <section className="mb-12">
          <h2
            className="mb-4 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            主脚本 (main.py)
          </h2>
          <p className="mb-3 text-sm text-muted">
            可以直接运行的主脚本，包含所有功能。运行{" "}
            <code className="rounded bg-code-bg px-1.5 py-0.5 text-xs text-white/90">
              python main.py
            </code>{" "}
            即可执行全部分析。
          </p>
          <div className="overflow-x-auto rounded-xl bg-code-bg p-5">
            <pre className="text-sm leading-relaxed font-mono">
              <code className="text-white/90">
                {mainPyContent}
              </code>
            </pre>
          </div>
        </section>
      )}

      {/* Explained Script */}
      {explainedPyContent && (
        <section className="mb-12">
          <h2
            className="mb-4 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            讲解版 (explained.py)
          </h2>
          <p className="mb-3 text-sm text-muted">
            逐行注释版本，适合学习阅读。每一行都解释了"为什么这样写"。
          </p>
          <div className="overflow-x-auto rounded-xl bg-code-bg p-5">
            <pre className="text-sm leading-relaxed font-mono">
              <code className="text-white/90">
                {explainedPyContent}
              </code>
            </pre>
          </div>
        </section>
      )}

      {/* Learning Notes */}
      {notesContent && (
        <section className="mb-12">
          <h2
            className="mb-4 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            学习笔记
          </h2>
          <div
            className="rounded-xl border-2 border-dashed border-accent-yellow/40 bg-accent-yellow/5 p-6"
            style={{ fontFamily: "var(--font-kalam)" }}
          >
            {renderMarkdown(notesContent)}
          </div>
        </section>
      )}

      {/* 说明 */}
      <section className="mt-16 border-t border-border pt-6">
        <p className="text-center text-xs leading-relaxed text-muted">
          本页面内容为个人学习记录，代码和数据用于教学演示。
        </p>
      </section>
    </div>
  );
}

/* -------------------------------------------------------
   Static Generation
   ------------------------------------------------------- */

export function generateStaticParams() {
  return Object.keys(MODULES).map((slug) => ({
    module: slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { module: moduleSlug } = await params;
  const meta = MODULES[moduleSlug];
  if (!meta) return { title: "模块未找到" };
  return {
    title: meta.title,
    description: meta.description,
  };
}
