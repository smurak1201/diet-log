"use client";

// アプリ共通のトースト通知 (sonner ラッパー)
// - 配置は top-center: 下部タブバーと被らない
// - 配色は globals.css の CSS 変数で DADS トークンに寄せている

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      duration={3000}
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-8 shadow-3 text-std-14N-130",
        },
      }}
    />
  );
}
