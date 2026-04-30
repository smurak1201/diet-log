import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// className を結合し、Tailwind の競合クラス (例: `p-2` と `p-4`) は後勝ちで解決する。
// 条件分岐がない単純な短い className には使わず、文字列直書きで OK。
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
