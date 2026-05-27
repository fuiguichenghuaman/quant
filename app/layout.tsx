import type { Metadata } from "next";
import { Patrick_Hand, Kalam } from "next/font/google";
import SiteFooter from "@/components/ComplianceBanner";
import Navbar from "@/components/Navbar";
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
    "从零开始的量化学习研究平台 —— 真实记录学习过程，策略研发验证。",
  metadataBase: new URL("https://quant-learning-platform.vercel.app"),
};

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
        <SiteFooter />
      </body>
    </html>
  );
}
