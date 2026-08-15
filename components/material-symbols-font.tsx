"use client";

// Material Symbols の <link rel="stylesheet"> はレンダリングをブロックするため、
// マウント後 (hydration 後) に注入して初期描画をブロックしないようにする。
// アイコンの読み込みはわずかに遅れる (FOUT) が、初回描画優先のトレードオフとして許容する

import { useEffect } from "react";

const MATERIAL_SYMBOLS_HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap";

export function MaterialSymbolsFont() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = MATERIAL_SYMBOLS_HREF;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null;
}
