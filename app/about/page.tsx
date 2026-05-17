import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <h1
        className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        关于
      </h1>
      <p className="mb-8 text-lg text-muted">建设中</p>

      <div className="rounded-xl border border-border bg-card-bg p-6">
        <p className="text-sm leading-relaxed text-muted">
          本站仅为个人量化学习研究记录，不构成任何投资建议。不荐股、不承诺收益、不带单、不引导开户或入金。所有策略、回测、数据仅供学习参考。
        </p>
      </div>
    </div>
  );
}
