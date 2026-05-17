/**
 * LearningRoadmap - 学习路线图
 *
 * 参考 Voxyz SBTI 头像行设计：
 * 横向滚动展示学习路径节点，节点间有连接线。
 * 使用 overflow-x-auto 实现横向滚动。当前使用静态 mock 数据。
 */

type NodeStatus = "completed" | "current" | "upcoming";

interface RoadmapNode {
  id: string;
  name: string;
  status: NodeStatus;
}

const roadmapNodes: RoadmapNode[] = [
  { id: "basics", name: "量化基础概念", status: "completed" },
  { id: "data", name: "数据获取与清洗", status: "completed" },
  { id: "indicators", name: "技术指标研究", status: "completed" },
  { id: "ma", name: "均线策略", status: "completed" },
  { id: "macd", name: "MACD 策略", status: "completed" },
  { id: "rsi", name: "RSI 策略", status: "current" },
  { id: "backtest", name: "回测框架", status: "current" },
  { id: "risk", name: "风控基础", status: "upcoming" },
  { id: "portfolio", name: "组合管理", status: "upcoming" },
  { id: "optimization", name: "策略优化", status: "upcoming" },
  { id: "paper-trade", name: "模拟交易", status: "upcoming" },
  { id: "review", name: "复盘方法论", status: "upcoming" },
];

const statusStyles: Record<NodeStatus, { ring: string; dot: string; text: string }> = {
  completed: {
    ring: "border-accent-green",
    dot: "bg-accent-green",
    text: "text-foreground",
  },
  current: {
    ring: "border-accent-yellow",
    dot: "bg-accent-yellow",
    text: "text-foreground font-semibold",
  },
  upcoming: {
    ring: "border-border",
    dot: "bg-muted/30",
    text: "text-muted",
  },
};

export default function LearningRoadmap() {
  return (
    <section className="py-12">
      <h2
        className="mb-8 text-center text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        学习路线图
      </h2>

      {/* Scrollable container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-center gap-0 min-w-max px-4">
          {roadmapNodes.map((node, i) => {
            const style = statusStyles[node.status];
            return (
              <div key={node.id} className="flex items-center">
                {/* Node */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${style.ring} bg-card-bg transition-colors`}
                  >
                    {node.status === "completed" ? (
                      <svg className="h-5 w-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot} ${node.status === "current" ? "animate-pulse-soft" : ""}`} />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`mt-2 max-w-[80px] text-center text-xs leading-tight ${style.text}`}>
                    {node.name}
                  </span>
                </div>

                {/* Connector line */}
                {i < roadmapNodes.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-8 sm:w-12 ${
                      node.status === "completed" && roadmapNodes[i + 1].status !== "upcoming"
                        ? "bg-accent-green/60"
                        : node.status === "completed"
                          ? "bg-accent-green/30"
                          : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-green" />
          已完成
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-yellow animate-pulse-soft" />
          进行中
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted/30" />
          未开始
        </span>
      </div>
    </section>
  );
}
