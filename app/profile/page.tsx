"use client";

/**
 * ProfilePage - 个人中心
 *
 * 功能：
 * - 用户信息卡片（头像占位、用户名、加入日期）
 * - 学习进度追踪（已完成模块数、学习天数、最近学习模块）
 * - 已收藏策略列表（从 localStorage 读取）
 * - 学习路线推荐
 * - 退出登录
 * - 未登录时显示提示
 */

import { useState, useEffect } from "react";
import Link from "next/link";

/* ---- Types ---- */

interface UserProfile {
  username: string;
  loggedIn: boolean;
  joinDate?: string;
}

interface FavoriteItem {
  slug: string;
  name: string;
  addedAt: string;
}

/* ---- Static data for learning progress ---- */

const allModules = [
  { slug: "01-numpy-basics", name: "NumPy 股票数据基础", status: "completed" as const },
  { slug: "02-kline-visualization", name: "K 线图可视化", status: "completed" as const },
  { slug: "03-macd-indicator", name: "MACD 指标研究", status: "completed" as const },
  { slug: "07-ma-crossover-strategy", name: "MA 均线交叉策略", status: "in-progress" as const },
  { slug: "09-order-cost-slippage", name: "交易成本与滑点", status: "in-progress" as const },
  { slug: "10-backtest-reproducibility", name: "回测可复现性", status: "in-progress" as const },
];

const recommendations = [
  {
    slug: "04-rsi-indicator",
    name: "RSI 相对强弱指标",
    reason: "学习更多技术指标，拓展分析维度",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    slug: "05-bollinger-bands",
    name: "布林带指标",
    reason: "了解波动率分析，完善指标体系",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
  {
    slug: "11-portfolio-basics",
    name: "投资组合基础",
    reason: "从单策略过渡到组合思维",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </svg>
    ),
  },
];

/* ---- Sub-components ---- */

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-red/10 text-xl font-bold text-accent-red">
      {initial}
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
  bgColor,
  icon,
}: {
  value: number | string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card-bg p-5 shadow-sm">
      <div className={`mb-2 rounded-lg ${bgColor} p-2 ${color}`}>{icon}</div>
      <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      <span className="mt-0.5 text-xs text-muted">{label}</span>
    </div>
  );
}

/* ---- Main Component ---- */

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("qlab_user");
      if (raw) {
        const parsed: UserProfile = JSON.parse(raw);
        if (parsed.loggedIn) {
          setUser(parsed);
        }
      }
      const favRaw = localStorage.getItem("qlab_favorites");
      if (favRaw) {
        setFavorites(JSON.parse(favRaw));
      }
    } catch {
      // corrupted data, treat as not logged in
    }
    setLoading(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem("qlab_user");
    localStorage.removeItem("qlab_remember");
    window.location.href = "/";
  }

  function removeFavorite(slug: string) {
    const updated = favorites.filter((f) => f.slug !== slug);
    setFavorites(updated);
    localStorage.setItem("qlab_favorites", JSON.stringify(updated));
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted">加载中...</div>
      </div>
    );
  }

  /* ---- Not logged in ---- */
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow/10">
          <svg
            className="h-8 w-8 text-accent-yellow"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
        </div>
        <h1
          className="mb-3 text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          请先登录
        </h1>
        <p className="mb-8 text-sm text-muted">
          登录后可查看个人学习进度、收藏策略和学习路线推荐。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          前往登录
        </Link>
      </div>
    );
  }

  /* ---- Logged in ---- */
  const completedModules = allModules.filter((m) => m.status === "completed");
  const inProgressModules = allModules.filter((m) => m.status === "in-progress");

  // Calculate learning days from join date
  const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();
  const now = new Date();
  const diffMs = now.getTime() - joinDate.getTime();
  const learningDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  const joinDateFormatted = user.joinDate || new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Page header */}
      <h1
        className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        个人中心
      </h1>

      {/* ---- User info card ---- */}
      <section className="mb-8 rounded-xl border border-border bg-card-bg p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <UserAvatar name={user.username} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
            <p className="mt-1 text-sm text-muted">
              加入日期：{joinDateFormatted}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent-red hover:text-accent-red"
          >
            退出登录
          </button>
        </div>
      </section>

      {/* ---- Learning stats ---- */}
      <section className="mb-8">
        <h2
          className="mb-4 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          学习进度
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            value={completedModules.length}
            label="已完成模块"
            color="text-accent-green"
            bgColor="bg-accent-green/10"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            value={inProgressModules.length}
            label="进行中"
            color="text-accent-yellow"
            bgColor="bg-accent-yellow/10"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            }
          />
          <StatCard
            value={learningDays}
            label="学习天数"
            color="text-accent-red"
            bgColor="bg-accent-red/10"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
          />
          <StatCard
            value={favorites.length}
            label="收藏策略"
            color="text-foreground"
            bgColor="bg-foreground/5"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
          />
        </div>

        {/* Recent modules */}
        <div className="mt-4 rounded-xl border border-border bg-card-bg p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">最近学习模块</h3>
          <div className="space-y-2">
            {allModules.slice(0, 3).map((mod) => (
              <Link
                key={mod.slug}
                href={`/learn/${mod.slug}`}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:border-accent-red/30"
              >
                <span className="text-foreground">{mod.name}</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs ${
                    mod.status === "completed" ? "text-accent-green" : "text-accent-yellow"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      mod.status === "completed" ? "bg-accent-green" : "bg-accent-yellow"
                    }`}
                  />
                  {mod.status === "completed" ? "已完成" : "进行中"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Favorites ---- */}
      <section className="mb-8">
        <h2
          className="mb-4 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          已收藏策略
        </h2>
        {favorites.length === 0 ? (
          <div className="rounded-xl border border-border bg-card-bg p-8 text-center shadow-sm">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
              <svg
                className="h-6 w-6 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted">暂无收藏的策略</p>
            <Link
              href="/strategies"
              className="mt-3 inline-block text-sm text-accent-red hover:underline"
            >
              浏览策略档案
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => (
              <div
                key={fav.slug}
                className="flex items-center justify-between rounded-xl border border-border bg-card-bg px-5 py-4 shadow-sm"
              >
                <div>
                  <Link
                    href={`/strategies/${fav.slug}`}
                    className="text-sm font-medium text-foreground hover:text-accent-red transition-colors"
                  >
                    {fav.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    收藏于 {fav.addedAt}
                  </p>
                </div>
                <button
                  onClick={() => removeFavorite(fav.slug)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-red hover:text-accent-red"
                >
                  取消收藏
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- Recommendations ---- */}
      <section className="mb-8">
        <h2
          className="mb-4 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          学习路线推荐
        </h2>
        <p className="mb-4 text-sm text-muted">
          基于你当前的学习进度，推荐以下下一步学习内容：
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {recommendations.map((rec) => (
            <Link
              key={rec.slug}
              href={`/learn/${rec.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-card-bg p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-3 rounded-lg bg-accent-yellow/10 p-2.5 text-accent-yellow w-fit">
                {rec.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground group-hover:text-accent-red transition-colors">
                {rec.name}
              </h3>
              <p className="flex-1 text-xs leading-relaxed text-muted">
                {rec.reason}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent-red">
                开始学习
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Compliance notice */}
      <div className="rounded-lg border border-accent-yellow/20 bg-accent-yellow/5 px-5 py-4">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-yellow"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <div>
            <p className="text-xs font-medium text-foreground/80">免责声明</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              本站仅为个人量化学习研究记录，不构成任何投资建议。不荐股、不承诺收益、不带单、不引导开户或入金。所有策略、回测、数据仅供学习参考。股市有风险，投资需谨慎。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
