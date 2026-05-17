/**
 * LearningLog - 学习日志
 *
 * 参考 Voxyz Agent 活动流设计：
 * 时间线式展示最近学习内容，使用相对时间。
 * 当前使用静态 mock 数据。
 */

interface LogEntry {
  id: string;
  time: string;       // relative time label
  module: string;
  category: string;
  summary: string;
  categoryColor: string;
}

const mockLogs: LogEntry[] = [
  {
    id: "log-1",
    time: "今天",
    module: "RSI 超买超卖",
    category: "指标研究",
    summary: "完成 RSI 指标的 Python 实现，对比了 14 日和 28 日周期的信号差异。发现短周期在震荡市中假信号较多。",
    categoryColor: "bg-accent-red/10 text-accent-red",
  },
  {
    id: "log-2",
    time: "今天",
    module: "回测框架搭建",
    category: "工程实践",
    summary: "用 backtrader 搭建了第一个回测脚本，加载了沪深 300 日线数据。跑通了从数据加载到绩效输出的完整流程。",
    categoryColor: "bg-accent-green/10 text-accent-green",
  },
  {
    id: "log-3",
    time: "3 天前",
    module: "MACD 策略研究",
    category: "策略复盘",
    summary: "对 MACD 金叉策略做了 2020-2024 年回测。年化约 8.2%，最大回撤 15.3%。信号延迟是主要问题。",
    categoryColor: "bg-accent-yellow/15 text-foreground/70",
  },
  {
    id: "log-4",
    time: "上周",
    module: "均线策略入门",
    category: "学习笔记",
    summary: "整理了简单移动平均线（SMA）和指数移动平均线（EMA）的区别。EMA 对近期价格更敏感，适合趋势跟踪。",
    categoryColor: "bg-foreground/5 text-muted",
  },
  {
    id: "log-5",
    time: "上周",
    module: "量化基础概念",
    category: "学习笔记",
    summary: "阅读了《量化投资：策略与技术》前三章。记录了量化交易的基本流程：数据 -> 信号 -> 执行 -> 评估。",
    categoryColor: "bg-foreground/5 text-muted",
  },
];

export default function LearningLog() {
  return (
    <section className="py-12">
      <h2
        className="mb-8 text-center text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        学习日志
      </h2>

      <div className="mx-auto max-w-2xl">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border sm:left-6" />

          <div className="space-y-6">
            {mockLogs.map((log) => (
              <div key={log.id} className="relative flex gap-4 sm:gap-6">
                {/* Timeline dot */}
                <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card-bg sm:h-12 sm:w-12">
                  <span className="h-2 w-2 rounded-full bg-accent-yellow" />
                </div>

                {/* Content card */}
                <div className="flex-1 rounded-xl border border-border bg-card-bg p-4 shadow-sm">
                  {/* Header: time + module */}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted">{log.time}</span>
                    <span className="text-xs text-border">|</span>
                    <span className="text-sm font-semibold text-foreground">{log.module}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${log.categoryColor}`}>
                      {log.category}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-sm leading-relaxed text-muted">{log.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
