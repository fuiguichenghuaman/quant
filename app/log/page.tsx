import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学习日志",
  description: "记录每一天的量化学习过程 —— 学习笔记、代码实验、策略研究、踩坑记录、复盘总结。",
};

/* ============================================
   Types
   ============================================ */

interface LogEntry {
  id: string;
  date: string;       // absolute date for sorting
  relativeTime: string; // display label
  module: string;
  category: string;
  categoryColor: string;
  summary: string;
  reflection?: string; // optional hand-written style reflection
}

/* ============================================
   Mock Data - 7 条真实感学习日志
   ============================================ */

const mockLogs: LogEntry[] = [
  {
    id: "log-1",
    date: "2026-05-17",
    relativeTime: "今天",
    module: "RSI 超买超卖指标",
    category: "指标研究",
    categoryColor: "bg-accent-red/10 text-accent-red border-accent-red/20",
    summary:
      "完成了 RSI 指标的 Python 实现，对比了 14 日和 28 日周期的信号差异。发现短周期在震荡市中假信号明显偏多，需要结合其他指标做信号过滤。",
    reflection: "指标不是万能的，组合使用才是关键。",
  },
  {
    id: "log-2",
    date: "2026-05-17",
    relativeTime: "今天",
    module: "回测框架搭建",
    category: "代码实验",
    categoryColor: "bg-accent-green/10 text-accent-green border-accent-green/20",
    summary:
      "用 backtrader 搭建了第一个回测脚本，加载了沪深 300 日线数据。跑通了从数据加载到策略执行到绩效输出的完整流程。遇到时区和日期格式的坑。",
  },
  {
    id: "log-3",
    date: "2026-05-14",
    relativeTime: "3 天前",
    module: "MACD 金叉策略回测",
    category: "策略研究",
    categoryColor: "bg-accent-yellow/20 text-foreground/70 border-accent-yellow/30",
    summary:
      "对 MACD 金叉策略做了 2020-2024 年回测。年化约 8.2%，最大回撤 15.3%。信号延迟是主要问题，考虑加入成交量确认条件。",
    reflection: "简单策略也能跑赢存款，但距离实盘还差得远。",
  },
  {
    id: "log-4",
    date: "2026-05-12",
    relativeTime: "5 天前",
    module: "K 线图绘制踩坑",
    category: "踩坑记录",
    categoryColor: "bg-foreground/5 text-muted border-border",
    summary:
      "mplfinance 的 candlestick_ohlc 函数要求 DataFrame 列名必须是 Open/High/Low/Close，小写会直接报错。A 股的红涨绿跌配色需要用 marketcolors 参数自定义。花了两小时才调通。",
    reflection: "库的文档永远比 Stack Overflow 靠谱。",
  },
  {
    id: "log-5",
    date: "2026-05-10",
    relativeTime: "上周",
    module: "Pandas 数据处理",
    category: "学习笔记",
    categoryColor: "bg-foreground/5 text-muted border-border",
    summary:
      "系统学习了 Pandas 的 DataFrame 操作：筛选、分组、合并、透视表。用股票数据做了练习，处理了缺失值和异常值。数据清洗占了 80% 的时间。",
  },
  {
    id: "log-6",
    date: "2026-05-07",
    relativeTime: "10 天前",
    module: "均线策略入门",
    category: "学习笔记",
    categoryColor: "bg-foreground/5 text-muted border-border",
    summary:
      "整理了简单移动平均线（SMA）和指数移动平均线（EMA）的区别。EMA 对近期价格更敏感，适合趋势跟踪。做了 5 日/20 日均线交叉策略的简单回测。",
    reflection: "先理解原理，再写代码，最后看结果。顺序不能反。",
  },
  {
    id: "log-7",
    date: "2026-05-03",
    relativeTime: "2 周前",
    module: "NumPy 基础巩固",
    category: "代码实验",
    categoryColor: "bg-accent-green/10 text-accent-green border-accent-green/20",
    summary:
      "用 NumPy 实现了股票收益率计算、最大回撤函数、滚动窗口统计。向量化操作比 for 循环快了 50 倍以上，深刻体会到 NumPy 的性能优势。",
    reflection: "性能优化从选对数据结构开始。",
  },
];

/* ============================================
   Timeline Dot Colors
   ============================================ */

const dotColors: Record<string, string> = {
  "指标研究": "bg-accent-red",
  "代码实验": "bg-accent-green",
  "策略研究": "bg-accent-yellow",
  "踩坑记录": "bg-foreground/40",
  "学习笔记": "bg-foreground/30",
};

/* ============================================
   Page Component
   ============================================ */

export default function LogPage() {
  // Group logs by date for section headers
  const grouped = mockLogs.reduce<Record<string, LogEntry[]>>((acc, log) => {
    if (!acc[log.relativeTime]) acc[log.relativeTime] = [];
    acc[log.relativeTime].push(log);
    return acc;
  }, {});

  const timeGroups = Object.entries(grouped);

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      {/* ===== Header ===== */}
      <div className="mb-16 text-center">
        <h1
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          学习日志
        </h1>
        <p className="text-lg text-muted">记录每一天的学习过程</p>

        {/* Decorative separator */}
        <div className="mx-auto mt-8 flex items-center gap-3 text-muted/30">
          <span className="h-px flex-1 max-w-[80px] bg-border" />
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="h-px flex-1 max-w-[80px] bg-border" />
        </div>
      </div>

      {/* ===== Timeline ===== */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border sm:left-6" />

        <div className="space-y-12">
          {timeGroups.map(([timeLabel, logs]) => (
            <div key={timeLabel}>
              {/* Time group label */}
              <div className="relative mb-6 flex items-center gap-4">
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background sm:h-12 sm:w-12">
                  <span className="h-2 w-2 rounded-full bg-accent-yellow" />
                </div>
                <span
                  className="text-lg font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-patrick-hand)" }}
                >
                  {timeLabel}
                </span>
              </div>

              {/* Log entries in this group */}
              <div className="ml-4 space-y-4 sm:ml-6">
                {logs.map((log) => (
                  <article
                    key={log.id}
                    className="group rounded-xl border border-border bg-card-bg p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    {/* Header row */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {log.module}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${log.categoryColor}`}
                      >
                        {log.category}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm leading-relaxed text-muted">
                      {log.summary}
                    </p>

                    {/* Reflection (hand-written style) */}
                    {log.reflection && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p
                          className="text-sm leading-relaxed text-foreground/70 italic"
                          style={{
                            fontFamily: "var(--font-patrick-hand)",
                          }}
                        >
                          &ldquo;{log.reflection}&rdquo;
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Bottom compliance note ===== */}
      <div className="mt-16 rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 px-6 py-5">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-yellow"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground/80">
              学习记录说明
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              以上日志仅为个人学习过程的真实记录，所有策略、指标、回测结果仅供学习参考，不构成任何投资建议。不荐股、不承诺收益、不带单、不引导开户或入金。股市有风险，投资需谨慎。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
