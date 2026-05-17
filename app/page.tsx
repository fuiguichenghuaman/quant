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
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        {/* Status badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-yellow/40 bg-accent-yellow/10 px-4 py-1.5 text-sm text-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent-yellow animate-pulse-soft" />
          建设中
        </div>

        {/* Main heading */}
        <h1
          className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          从零开始的量化学习实验室
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          真实记录学习过程，策略研发验证，研究可复现。
          <br />
          不荐股、不承诺收益、不带单。
        </p>

        {/* CTA Button */}
        <a
          href="/learn"
          className="inline-block rounded-lg bg-accent-red px-8 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          开始学习
        </a>
      </section>

      {/* ===== Progress Dashboard ===== */}
      <ProgressDashboard />

      {/* ===== Module Cards ===== */}
      <ModuleCardGrid />

      {/* ===== Learning Roadmap ===== */}
      <LearningRoadmap />

      {/* ===== Learning Log ===== */}
      <LearningLog />

    </div>
  );
}
