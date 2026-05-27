"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/learn", label: "学习路线" },
  { href: "/log", label: "学习日志" },
  { href: "/strategies", label: "策略档案" },
  { href: "/backtest", label: "回测" },
  { href: "/community", label: "社区" },
  { href: "/ai-analysis", label: "AI 分析" },
  { href: "/about", label: "关于" },
];

const GitHubIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-red text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-foreground" style={{ fontFamily: "var(--font-patrick-hand)" }}>
              QLab
            </span>
            <span className="hidden text-[11px] leading-tight text-muted sm:block">量化学习实验室</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 text-sm md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/learn" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "font-medium text-accent-red" : "text-foreground/70 transition-colors hover:text-accent-red"}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="h-4 w-px bg-border" />
          <Link href="/login" className="rounded-lg bg-accent-red/10 px-3 py-1.5 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/20">
            登录
          </Link>
          <a
            href="https://github.com/fuiguichenghuaman/quant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 hover:bg-foreground/5 md:hidden"
          aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu dropdown */}
      <div
        className={`absolute left-0 right-0 top-16 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-200 md:hidden ${
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-2 pointer-events-none opacity-0"
        }`}
        role="navigation"
        aria-label="移动端导航"
      >
        <div className="space-y-1 px-6 py-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/learn" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-accent-red/10 font-medium text-accent-red" : "text-foreground/70 hover:bg-foreground/5 hover:text-accent-red"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/10"
          >
            登录
          </Link>
          <a
            href="https://github.com/fuiguichenghuaman/quant"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
