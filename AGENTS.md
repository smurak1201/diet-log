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

## React / Next.js コーディング規約 (Next 16 + React 19)

### Server / Client コンポーネント
- **Server Component がデフォルト**。`'use client'` は state / イベントハンドラ / ブラウザ API / lifecycle hook が必要なときのみ、最小範囲のリーフに付与する。page / layout 全体を Client 化しない。
- データ取得は Server Component で `async/await` (DB / fetch 直接 OK)。**Client Component から直接 fetch しない** — Server で取って props で渡すか、Promise を渡して `use()` で stream する。
- `params` / `searchParams` / `cookies()` / `headers()` は Next 16 で **完全 async**。必ず `await` する (型も `Promise<...>`)。
- Context は Client Component。Provider は `children` をラップする形で**できるだけ深く**配置 (root layout 全体を Client 化しない)。
- DB 接続や API キーを扱うモジュールには `import 'server-only'` を入れて Client にバンドルされないように boundary を強制。

### データ変更は Server Actions
- ミューテーションは Server Action (`'use server'`) を第一選択。Route Handler (`route.ts`) は外部 API / webhook / 専用 GET 用に限定。
- **各 Action 冒頭で auth/authz を必ず検証** — Action は POST で直接叩ける。
- 入力検証は **server 側で zod 等を使い必ず実行**。HTML の `required` / `type=email` は UX hint に過ぎない。
- ミューテーション後はキャッシュ整合: `revalidateTag(tag, profile)` / `revalidatePath(path)` / `refresh()`。**Next 16 で `revalidateTag` は第2引数 (cacheLife profile) が必須**。
- `redirect()` は `revalidatePath` / `revalidateTag` の**後**に呼ぶ (redirect 後は実行されない)。

### フォーム
- `<form action={serverAction}>` を基本形 (progressive enhancement で JS 無しでも動く)。
- error / pending を扱うフォームは React 19 の `useActionState(action, initialState)`。
- 子コンポーネントで pending を見るときは `useFormStatus()` (props バケツリレー不要)。
- 楽観的更新は `useOptimistic`。
- 複数引数を渡したいときは `action.bind(null, extraArg)` (隠し input より安全)。

### React 19 の新パターン (旧 API は使わない)
- **`forwardRef` は使わない** — `ref` は通常の prop として受け取る (`function Comp({ ref, ... })`)。
- ref callback 内で setup → `return () => {...}` で cleanup を返す形にする。
- 条件分岐の後で Promise を解決するときや Context を読むときは **`use()`** (旧 `useContext` は早期 return できない)。
- ルート/ページの metadata は **Next.js の `export const metadata` / `viewport`** を使う。`<title>`/`<meta>` を component 内に直書きしない (Next の静的解析が効かなくなる)。

### 避けるべきパターン
- `useEffect` でデータ取得 → Server Component で fetch する
- `useEffect` で派生 state を計算 → render 中に derive
- 派生計算が重いだけのために `useMemo` を多用 → React Compiler に任せる前提でまずシンプルに書く
- Client Component を不必要に大きくする → 葉に下げる、Server Component を `children` 経由で interleave する
- Server↔Client 境界を跨ぐ props に関数やクラスを載せる → serializable な値だけ (Server Action は OK)


