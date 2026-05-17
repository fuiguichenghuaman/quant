/**
 * ComplianceBanner - 合规声明
 *
 * 独立的合规声明组件，可在首页底部、layout 底部等位置复用。
 * 样式：小字、低调、始终可见。
 */

export default function ComplianceBanner() {
  return (
    <div className="border-t border-border bg-card-bg">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <p className="text-center text-xs leading-relaxed text-muted">
          仅为个人学习记录，不构成投资建议。不荐股、不承诺收益、不带单。
        </p>
      </div>
    </div>
  );
}
