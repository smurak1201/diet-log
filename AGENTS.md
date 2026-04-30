<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: ダイエットログ (diet-log)

## 記録対象データ
- 運動: 日付 / 距離 / 平均ペース / 時間 / 消費カロリー / 平均心拍数
- 体組成: 体重 / 体脂肪率 / 筋肉量 / 内臓脂肪 / 基礎代謝

## Stack
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (CSS-first / `@plugin` 構文)
- 永続化: **Neon Postgres** (Vercel 経由)。接続情報は `.env` に配置済み。
- デプロイ先: Vercel

## Design system — デジタル庁デザインシステム (DADS) を厳守
https://design.digital.go.jp/dads/foundations/

- パッケージ: `@digital-go-jp/design-tokens`, `@digital-go-jp/tailwind-theme-plugin`
- フォント: Noto Sans JP (weight 400/700 のみ)。和文は OS フォールバック (`-apple-system, BlinkMacSystemFont, sans-serif`)。
- アイコン: Material Symbols (Outlined) — Google Fonts CDN
- 配色: DADS トークンユーティリティのみ (例: `bg-white`, `text-solid-gray-900`, `border-solid-gray-200`, `bg-blue-800`, `bg-success-1`)。**生 hex 禁止**。**ダークモード無し** (DADS にダークトークンが存在しないため)。
- タイポ: DADS タイポプリセット (例: `text-std-16N-170`, `text-std-24B-150`, `text-dns-14N-130`)。**14px 未満禁止**。
- 角丸: `rounded-{4,6,8,12,16,24,32,full}` (DADS スケール)
- 影: `shadow-{1..8}` (DADS elevation)
- 新規コンポーネントは作る前に DADS のリファレンス実装を確認:
  https://github.com/digital-go-jp/design-system-example-components

## UX 制約
- **モバイル優先** — スマホで毎日記録する想定。`max-w-screen-sm` 中心の縦長レイアウト。
- **言語**: 日本語 (`<html lang="ja">`)
- **アクセシビリティ**: WCAG 2.2 AA / JIS X 8341-3:2016 準拠
  - スキップリンク必須、フォーカスリング非削除
  - テキストコントラスト 4.5:1、UI 3:1

