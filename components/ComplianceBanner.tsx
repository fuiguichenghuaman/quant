/**
 * SiteFooter - 站点底部信息
 *
 * 独立的底部信息组件，可在首页底部、layout 底部等位置复用。
 */

export default function SiteFooter() {
  return (
    <div className="border-t border-border bg-foreground/[0.02]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <p className="text-xs leading-relaxed text-muted">
          本站为个人量化学习研究记录，所有策略、回测、数据仅供学习参考。
        </p>
      </div>
    </div>
  );
}
