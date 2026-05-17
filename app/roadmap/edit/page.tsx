"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import defaultRoadmapData from "@/data/roadmap.json";

/* ---- Types ---- */

interface Step {
  id: string;
  name: string;
  description: string;
  link: string | null;
  linkText: string | null;
  completed: boolean;
}

interface Stage {
  id: string;
  name: string;
  description: string;
  color: "green" | "yellow" | "red";
  steps: Step[];
}

interface RoadmapData {
  title: string;
  subtitle: string;
  stages: Stage[];
}

/* ---- Color mapping for preview ---- */

const colorMap: Record<
  Stage["color"],
  { border: string; bg: string; dot: string }
> = {
  green: {
    border: "border-l-accent-green",
    bg: "bg-accent-green/5",
    dot: "text-accent-green",
  },
  yellow: {
    border: "border-l-accent-yellow",
    bg: "bg-accent-yellow/5",
    dot: "text-accent-yellow",
  },
  red: {
    border: "border-l-accent-red",
    bg: "bg-accent-red/5",
    dot: "text-accent-red",
  },
};

/* ---- Helper: generate unique ID ---- */

function newId(): string {
  return Date.now().toString(36);
}

/* ---- Page Component ---- */

export default function RoadmapEditPage() {
  const [data, setData] = useState<RoadmapData>(defaultRoadmapData as RoadmapData);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("qlab_roadmap_data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  /* ---- Show feedback message ---- */

  function showMessage(text: string, type: "success" | "error" = "success") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  }

  /* ---- Save to localStorage ---- */

  function handleSave() {
    try {
      localStorage.setItem("qlab_roadmap_data", JSON.stringify(data));
      showMessage("保存成功！");
    } catch {
      showMessage("保存失败，请检查浏览器存储空间", "error");
    }
  }

  /* ---- Export JSON ---- */

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roadmap.json";
    a.click();
    URL.revokeObjectURL(url);
    showMessage("JSON 文件已下载");
  }

  /* ---- Reset to default ---- */

  function handleReset() {
    if (confirm("确定要重置为默认数据吗？所有修改将丢失。")) {
      setData(defaultRoadmapData as RoadmapData);
      localStorage.removeItem("qlab_roadmap_data");
      showMessage("已重置为默认数据");
    }
  }

  /* ---- Toggle stage expansion ---- */

  function toggleStage(stageId: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }

  /* ---- Update top-level fields ---- */

  function updateTitle(value: string) {
    setData((prev) => ({ ...prev, title: value }));
  }

  function updateSubtitle(value: string) {
    setData((prev) => ({ ...prev, subtitle: value }));
  }

  /* ---- Stage CRUD ---- */

  function addStage() {
    const stage: Stage = {
      id: newId(),
      name: "新阶段",
      description: "阶段描述",
      color: "yellow",
      steps: [],
    };
    setData((prev) => ({ ...prev, stages: [...prev.stages, stage] }));
    setExpandedStages((prev) => new Set(prev).add(stage.id));
  }

  function deleteStage(stageId: string) {
    if (confirm("确定要删除这个阶段吗？该阶段下的所有步骤也会被删除。")) {
      setData((prev) => ({
        ...prev,
        stages: prev.stages.filter((s) => s.id !== stageId),
      }));
    }
  }

  function updateStage(stageId: string, field: keyof Stage, value: string) {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((s) =>
        s.id === stageId ? { ...s, [field]: value } : s
      ),
    }));
  }

  /* ---- Step CRUD ---- */

  function addStep(stageId: string) {
    const step: Step = {
      id: newId(),
      name: "新步骤",
      description: "步骤描述",
      link: null,
      linkText: null,
      completed: false,
    };
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((s) =>
        s.id === stageId ? { ...s, steps: [...s.steps, step] } : s
      ),
    }));
  }

  function deleteStep(stageId: string, stepId: string) {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((s) =>
        s.id === stageId
          ? { ...s, steps: s.steps.filter((st) => st.id !== stepId) }
          : s
      ),
    }));
  }

  function updateStep(
    stageId: string,
    stepId: string,
    field: keyof Step,
    value: string | boolean | null
  ) {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((s) =>
        s.id === stageId
          ? {
              ...s,
              steps: s.steps.map((st) =>
                st.id === stepId ? { ...st, [field]: value } : st
              ),
            }
          : s
      ),
    }));
  }

  /* ---- Render ---- */

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* ---- Top action bar ---- */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          返回首页
        </Link>

        <div className="flex-1" />

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-green px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-sm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
          保存到浏览器
        </button>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          导出 JSON
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent-red/30 bg-card-bg px-4 py-2 text-sm font-medium text-accent-red transition-all hover:bg-accent-red/5 hover:shadow-sm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
          重置为默认
        </button>
      </div>

      {/* ---- Feedback message ---- */}
      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-accent-green/30 bg-accent-green/10 text-foreground"
              : "border-accent-red/30 bg-accent-red/10 text-accent-red"
          }`}
        >
          {message}
        </div>
      )}

      {/* ---- Section: basic info ---- */}
      <section className="mb-8 rounded-xl border border-border bg-card-bg p-6 shadow-sm">
        <h2
          className="mb-4 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          基本信息
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              标题
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-red/50 focus:outline-none focus:ring-1 focus:ring-accent-red/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              副标题
            </label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => updateSubtitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-red/50 focus:outline-none focus:ring-1 focus:ring-accent-red/30"
            />
          </div>
        </div>
      </section>

      {/* ---- Section: stages ---- */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            阶段编辑
          </h2>
          <span className="text-sm text-muted">
            共 {data.stages.length} 个阶段
          </span>
        </div>

        <div className="space-y-4">
          {data.stages.map((stage, stageIndex) => {
            const isExpanded = expandedStages.has(stage.id);
            const colors = colorMap[stage.color];

            return (
              <div
                key={stage.id}
                className={`rounded-xl border border-border border-l-4 ${colors.border} bg-card-bg shadow-sm overflow-hidden`}
              >
                {/* Stage header (collapsible) */}
                <button
                  type="button"
                  onClick={() => toggleStage(stage.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-background/50"
                >
                  <svg
                    className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground truncate block">
                      {stageIndex + 1}. {stage.name || "(未命名阶段)"}
                    </span>
                    <span className="text-xs text-muted">
                      {stage.steps.length} 个步骤 &middot; 颜色: {stage.color}
                    </span>
                  </div>
                </button>

                {/* Stage body (expandable) */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-5 pb-5 pt-4">
                    {/* Stage fields */}
                    <div className="mb-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                          阶段名称
                        </label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) =>
                            updateStage(stage.id, "name", e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-red/50 focus:outline-none focus:ring-1 focus:ring-accent-red/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                          阶段描述
                        </label>
                        <input
                          type="text"
                          value={stage.description}
                          onChange={(e) =>
                            updateStage(stage.id, "description", e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-red/50 focus:outline-none focus:ring-1 focus:ring-accent-red/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                          颜色
                        </label>
                        <select
                          value={stage.color}
                          onChange={(e) =>
                            updateStage(
                              stage.id,
                              "color",
                              e.target.value as "green" | "yellow" | "red"
                            )
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-red/50 focus:outline-none focus:ring-1 focus:ring-accent-red/30"
                        >
                          <option value="green">绿色 (green)</option>
                          <option value="yellow">黄色 (yellow)</option>
                          <option value="red">红色 (red)</option>
                        </select>
                      </div>
                    </div>

                    {/* Steps list */}
                    <div className="mb-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">
                          步骤列表 ({stage.steps.length})
                        </span>
                      </div>

                      {stage.steps.length === 0 && (
                        <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted">
                          暂无步骤，点击下方按钮添加
                        </div>
                      )}

                      {stage.steps.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-background/50">
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted w-[140px]">
                                  名称
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted">
                                  描述
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted w-[140px]">
                                  链接
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted w-[100px]">
                                  链接文字
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-muted w-[60px]">
                                  完成
                                </th>
                                <th className="px-3 py-2 w-[50px]" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {stage.steps.map((step) => (
                                <tr
                                  key={step.id}
                                  className="group transition-colors hover:bg-background/30"
                                >
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      value={step.name}
                                      onChange={(e) =>
                                        updateStep(
                                          stage.id,
                                          step.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-foreground focus:border-border focus:bg-background focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      value={step.description}
                                      onChange={(e) =>
                                        updateStep(
                                          stage.id,
                                          step.id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-foreground focus:border-border focus:bg-background focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      value={step.link ?? ""}
                                      placeholder="可为空"
                                      onChange={(e) =>
                                        updateStep(
                                          stage.id,
                                          step.id,
                                          "link",
                                          e.target.value || null
                                        )
                                      }
                                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-muted placeholder:text-muted/50 focus:border-border focus:bg-background focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      value={step.linkText ?? ""}
                                      placeholder="链接文字"
                                      onChange={(e) =>
                                        updateStep(
                                          stage.id,
                                          step.id,
                                          "linkText",
                                          e.target.value || null
                                        )
                                      }
                                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-muted placeholder:text-muted/50 focus:border-border focus:bg-background focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={step.completed}
                                      onChange={(e) =>
                                        updateStep(
                                          stage.id,
                                          step.id,
                                          "completed",
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-border accent-accent-green cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteStep(stage.id, step.id)
                                      }
                                      className="rounded p-1 text-muted opacity-0 transition-all hover:bg-accent-red/10 hover:text-accent-red group-hover:opacity-100"
                                      title="删除步骤"
                                    >
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Stage action buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => addStep(stage.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:shadow-sm"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                        添加步骤
                      </button>

                      <div className="flex-1" />

                      <button
                        type="button"
                        onClick={() => deleteStage(stage.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-accent-red/30 bg-card-bg px-3 py-1.5 text-xs font-medium text-accent-red transition-all hover:bg-accent-red/5"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                        删除阶段
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add stage button */}
        <button
          type="button"
          onClick={addStage}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-all hover:border-accent-green/50 hover:text-foreground hover:bg-accent-green/5"
        >
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          添加新阶段
        </button>
      </section>

      {/* ---- Section: live preview ---- */}
      <section className="mb-8">
        <h2
          className="mb-4 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          实时预览
        </h2>

        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          {/* Preview title */}
          <h3
            className="mb-1 text-center text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            {data.title || "(未设置标题)"}
          </h3>
          <p className="mb-6 text-center text-sm text-muted">
            {data.subtitle || "(未设置副标题)"}
          </p>

          {/* Preview stages grid */}
          {data.stages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted">
              暂无阶段
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.stages.map((stage) => {
                const colors = colorMap[stage.color];

                return (
                  <div
                    key={stage.id}
                    className={`rounded-xl border border-border border-l-4 ${colors.border} ${colors.bg} bg-card-bg p-4`}
                  >
                    <h4
                      className="text-base font-bold text-foreground"
                      style={{ fontFamily: "var(--font-patrick-hand)" }}
                    >
                      {stage.name || "(未命名)"}
                    </h4>
                    <p className="mb-2 text-xs text-muted">
                      {stage.description || "(无描述)"}
                    </p>

                    <div className="divide-y divide-border/50">
                      {stage.steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-start gap-2 py-1.5"
                        >
                          <span className="mt-0.5 shrink-0">
                            {step.completed ? (
                              <svg
                                className="h-4 w-4 text-accent-green"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-4 w-4 text-muted/40"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                              >
                                <circle cx="12" cy="12" r="8" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs font-medium ${
                                step.completed
                                  ? "text-foreground"
                                  : "text-muted"
                              }`}
                            >
                              {step.name || "(未命名)"}
                            </span>
                            {step.link && step.linkText && (
                              <span className="ml-1 text-xs text-accent-red/60">
                                [{step.linkText}]
                              </span>
                            )}
                            {step.description && (
                              <p className="text-[11px] leading-relaxed text-muted/70 truncate">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {stage.steps.length === 0 && (
                        <p className="py-2 text-xs text-muted/50 italic">
                          暂无步骤
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
