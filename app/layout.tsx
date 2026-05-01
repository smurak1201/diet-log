import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { BottomTabNav } from "@/components/bottom-tab-nav";
import { Toaster } from "@/components/toaster";
import { cn } from "@/lib/cn";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "sans-serif"],
  adjustFontFallback: false,
  preload: true,
});

export const metadata: Metadata = {
  title: "ダイエットログ",
  description: "運動記録と体組成を管理するアプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ダイエットログ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={cn(notoSansJP.variable, "h-full antialiased")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols is an icon font (not supported by next/font); this is the root layout so the link is global, not per-page. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body
        className={cn(
          "min-h-full flex flex-col font-sans",
          "bg-white text-solid-gray-900",
          "pb-[calc(4rem+env(safe-area-inset-bottom))]",
        )}
      >
        {/* スキップリンク: キーボード操作時に最初の Tab で画面左上に出現し、ヘッダー/タブバーを飛ばして本文へ移動できる (WCAG 2.2 / JIS X 8341-3 対応)。普段は sr-only で非表示、フォーカス時のみ表示。 */}
        <a
          href="#main"
          className={cn(
            "sr-only",
            "focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50",
            "focus:px-3 focus:py-2 focus:bg-white focus:text-solid-gray-900",
            "focus:outline-2 focus:outline-focus-blue",
          )}
        >
          メインコンテンツへスキップ
        </a>
        {children}
        <BottomTabNav />
        <Toaster />
      </body>
    </html>
  );
}
