/**
 * ProgressDashboard - 学习进度仪表盘
 *
 * 参考 Voxyz Demand Radar 计数器设计：
 * 4 个统计数字，管道式布局，pulse 呼吸灯动画。
 * 当前使用静态 mock 数据。
 */

const stats = [
  {
    label: "已学模块",
    value: 5,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "text-accent-red",
    bgColor: "bg-accent-red/10",
  },
  {
    label: "已完成策略",
    value: 3,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "text-accent-yellow",
    bgColor: "bg-accent-yellow/10",
  },
  {
    label: "回测次数",
    value: 2,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: "text-accent-green",
    bgColor: "bg-accent-green/10",
  },
  {
    label: "学习天数",
    value: 30,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-foreground",
    bgColor: "bg-foreground/5",
  },
];

export default function ProgressDashboard() {
  return (
    <section className="py-12">
      <h2
        className="mb-8 text-center text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        学习进度
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="relative flex flex-col items-center rounded-xl border border-border bg-card-bg p-6 shadow-sm"
          >
            {/* Pulse dot */}
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent-green animate-pulse-soft" />

            {/* Icon */}
            <div className={`mb-3 rounded-lg ${stat.bgColor} p-2.5 ${stat.color}`}>
              {stat.icon}
            </div>

            {/* Value */}
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </span>

            {/* Label */}
            <span className="mt-1 text-sm text-muted">{stat.label}</span>

            {/* Flow connector (except last) */}
            {i < stats.length - 1 && (
              <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border sm:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
