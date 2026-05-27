import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <h1
        className="mb-4 text-6xl font-bold text-foreground/20"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        404
      </h1>
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        页面未找到
      </h2>
      <p className="mb-8 text-center text-muted">
        你访问的页面不存在或已被移动。
      </p>
      <Link
        href="/"
        className="rounded-lg bg-accent-red px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
      >
        返回首页
      </Link>
    </div>
  );
}
