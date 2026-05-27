"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <h1
        className="mb-4 text-6xl font-bold text-foreground/20"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        出错了
      </h1>
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        页面加载异常
      </h2>
      <p className="mb-8 text-center text-muted">
        {error.message || "发生了未知错误，请稍后重试。"}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent-red px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
      >
        重试
      </button>
    </div>
  );
}
