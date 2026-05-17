/**
 * ComplianceBanner - 合规声明
 *
 * 独立的合规声明组件，可在首页底部、layout 底部等位置复用。
 */

export default function ComplianceBanner() {
  return (
    <div className="border-t border-border bg-foreground/[0.02]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-start gap-3 rounded-lg border border-accent-yellow/20 bg-accent-yellow/5 px-5 py-4">
          {/* Shield icon */}
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-yellow" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground/80">免责声明</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              本站仅为个人量化学习研究记录，不构成任何投资建议。不荐股、不承诺收益、不带单、不引导开户或入金。所有策略、回测、数据仅供学习参考。股市有风险，投资需谨慎。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
