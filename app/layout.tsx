import type { Metadata } from "next";
import { Patrick_Hand, Kalam } from "next/font/google";
import Link from "next/link";
import ComplianceBanner from "@/components/ComplianceBanner";
import "./globals.css";

/* ============================================
   Google Fonts: hand-written style
   Used for decorative / personal-feel elements
   ============================================ */

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  display: "swap",
});

const kalam = Kalam({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
});

/* ============================================
   Metadata
   ============================================ */

export const metadata: Metadata = {
  title: {
    default: "量化学习实验室",
    template: "%s | 量化学习实验室",
  },
  description:
    "从零开始的量化学习研究平台 —— 真实记录学习过程，策略研发验证，不构成投资建议。",
  metadataBase: new URL("https://quant-learning-platform.vercel.app"),
};

/* ============================================
   Navigation
   ============================================ */

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* Logo icon: stylized chart line */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-red text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span
              className="text-lg font-bold leading-tight text-foreground"
              style={{ fontFamily: "var(--font-patrick-hand)" }}
            >
              QLab
            </span>
            <span className="hidden text-[11px] leading-tight text-muted sm:block">
              量化学习实验室
            </span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/learn"
            className="text-foreground/70 transition-colors hover:text-accent-red"
          >
            学习路径
          </Link>
          <Link
            href="/log"
            className="text-foreground/70 transition-colors hover:text-accent-red"
          >
            学习日志
          </Link>
          <Link
            href="/about"
            className="text-foreground/70 transition-colors hover:text-accent-red"
          >
            关于
          </Link>
          <a
            href="https://github.com/fuiguichenghuaman/quant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            {/* Inline GitHub icon */}
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ============================================
   Root Layout
   ============================================ */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${patrickHand.variable} ${kalam.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <ComplianceBanner />
      </body>
    </html>
  );
}
