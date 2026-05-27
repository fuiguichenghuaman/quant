export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-red" />
      <p className="mt-4 text-sm text-muted">加载中...</p>
    </div>
  );
}
