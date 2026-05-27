"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import defaultRoadmapData from "@/data/roadmap.json";

/* ---- Types ---- */

interface RoadmapStep {
  id: string;
  name: string;
  description: string;
  link: string | null;
  linkText: string | null;
  completed: boolean;
}

interface RoadmapStage {
  id: string;
  name: string;
  description: string;
  color: "green" | "yellow" | "red";
  steps: RoadmapStep[];
}

interface RoadmapData {
  title: string;
  subtitle: string;
  stages: RoadmapStage[];
}

/* ---- Color mapping ---- */

const colorMap: Record<
  RoadmapStage["color"],
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

/* ---- SVG icons ---- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

/* ---- Step row component ---- */

function StepRow({ step, dotColor }: { step: RoadmapStep; dotColor: string }) {
  const isExternal = step.link?.startsWith("http");

  const linkContent = step.link && step.linkText && (
    <span className="ml-2 shrink-0">
      {isExternal ? (
        <a
          href={step.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent-red hover:underline"
        >
          {step.linkText}
        </a>
      ) : (
        <Link href={step.link} className="text-sm text-accent-red hover:underline">
          {step.linkText}
        </Link>
      )}
    </span>
  );

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Status icon */}
      <span className={`mt-0.5 shrink-0 ${dotColor}`}>
        {step.completed ? (
          <CheckIcon className="text-accent-green" />
        ) : (
          <CircleIcon className="text-muted/40" />
        )}
      </span>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1">
          <span
            className={`text-sm font-medium ${
              step.completed ? "text-foreground" : "text-muted"
            }`}
          >
            {step.name}
          </span>
          {linkContent}
        </div>
        {step.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {step.description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- Stage card component ---- */

function StageCard({ stage }: { stage: RoadmapStage }) {
  const colors = colorMap[stage.color];

  return (
    <div
      className={`rounded-xl border border-border border-l-4 ${colors.border} ${colors.bg} bg-card-bg p-5 shadow-sm`}
    >
      <h3
        className="text-lg font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        {stage.name}
      </h3>
      <p className="mb-3 text-xs text-muted">{stage.description}</p>

      <div className="divide-y divide-border/50">
        {stage.steps.map((step) => (
          <StepRow key={step.id} step={step} dotColor={colors.dot} />
        ))}
      </div>
    </div>
  );
}

/* ---- Main component ---- */

export default function LearningRoadmap() {
  const [data, setData] = useState<RoadmapData>(defaultRoadmapData as RoadmapData);

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

  return (
    <section className="py-12">
      <h2
        className="mb-2 text-center text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        {data.title}
      </h2>
      <p className="mb-8 text-center text-sm text-muted">{data.subtitle}</p>

      <div className="grid gap-6 md:grid-cols-2">
        {data.stages.map((stage) => (
          <StageCard key={stage.id} stage={stage} />
        ))}
      </div>
    </section>
  );
}
