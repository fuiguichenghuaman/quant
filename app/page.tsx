/**
 * Home Page - 量化学习实验室首页
 *
 * 页面结构：
 * [Hero] -> [ProgressDashboard] -> [ModuleCard 网格] -> [LearningRoadmap] -> [LearningLog]
 */

import ProgressDashboard from "@/components/ProgressDashboard";
import ModuleCardGrid from "@/components/ModuleCard";
import LearningRoadmap from "@/components/LearningRoadmap";
import LearningLog from "@/components/LearningLog";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* ===== Hero Section ===== */}
      <section className="relative flex flex-col items-center py-20 text-center sm:py-28">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Floating dots */}
          <div className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-accent-red/20 animate-pulse-soft" />
          <div className="absolute right-[15%] top-[30%] h-3 w-3 rounded-full bg-accent-yellow/25 animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
          <div className="absolute left-[20%] bottom-[25%] h-2.5 w-2.5 rounded-full bg-accent-green/20 animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="absolute right-[25%] top-[15%] h-1.5 w-1.5 rounded-full bg-accent-red/15 animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

          {/* Subtle grid pattern */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
          </svg>
        </div>

        {/* Status badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-accent-yellow/40 bg-accent-yellow/10 px-4 py-1.5 text-sm text-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent-yellow animate-pulse-soft" />
          建设中
        </div>

        {/* Main heading */}
        <h1
          className="relative mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          从零开始的
          <br className="sm:hidden" />
          <span className="relative">
            量化学习
            <svg className="absolute -bottom-1 left-0 h-3 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
              <path d="M2 8 Q50 2 100 6 T198 4" stroke="#E84B3A" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
            </svg>
          </span>
          实验室
        </h1>

        {/* Subtitle */}
        <p className="relative mb-10 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          真实记录学习过程，策略研发验证，研究可复现。
          <br />
          <span className="text-foreground/60">不荐股、不承诺收益、不带单。</span>
        </p>

        {/* CTA Buttons */}
        <div className="relative flex flex-col gap-3 sm:flex-row">
          <a
            href="/learn"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
            开始学习
          </a>
          <a
            href="/about"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-8 py-3 text-base font-medium text-foreground transition-all hover:border-foreground/20 hover:shadow-sm"
          >
            了解更多
          </a>
        </div>

        {/* Decorative separator */}
        <div className="mt-16 flex items-center gap-4 text-muted/40">
          <span className="h-px w-16 bg-border" />
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <span className="h-px w-16 bg-border" />
        </div>
      </section>

      {/* ===== Progress Dashboard ===== */}
      <ProgressDashboard />

      {/* ===== Module Cards ===== */}
      <ModuleCardGrid />

      {/* ===== Research Tools ===== */}
      <section className="py-12">
        <h2
          className="mb-2 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          研究工具
        </h2>
        <p className="mb-8 text-center text-sm text-muted">
          从学习到实践，一站式量化研究工具
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <a
            href="/strategies"
            className="group flex flex-col items-center rounded-xl border border-border bg-card-bg p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="mb-4 rounded-lg bg-accent-red/10 p-3 text-accent-red">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-accent-red transition-colors">策略档案库</h3>
            <p className="text-center text-sm text-muted">策略描述、指标公式、参数说明、风险声明</p>
          </a>
          <a
            href="/backtest"
            className="group flex flex-col items-center rounded-xl border border-border bg-card-bg p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="mb-4 rounded-lg bg-accent-yellow/10 p-3 text-accent-yellow">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-accent-red transition-colors">在线回测</h3>
            <p className="text-center text-sm text-muted">选择策略、设置参数、运行回测、查看结果</p>
          </a>
          <a
            href="/data"
            className="group flex flex-col items-center rounded-xl border border-border bg-card-bg p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="mb-4 rounded-lg bg-accent-green/10 p-3 text-accent-green">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-accent-red transition-colors">数据管理</h3>
            <p className="text-center text-sm text-muted">上传 CSV、预览数据、查看统计指标</p>
          </a>
        </div>
      </section>

      {/* ===== Learning Roadmap ===== */}
      <LearningRoadmap />

      {/* ===== Learning Log ===== */}
      <LearningLog />

    </div>
  );
}
