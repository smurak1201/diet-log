# ダイエットログ (diet-log)

体組成と運動を毎日記録するモバイル向け PWA。Nike Run Club のスクショを Gemini で読み取り、入力を半自動化する個人プロジェクト。

## 機能

- 体組成記録 (体重・体脂肪率・筋肉量・内臓脂肪・基礎代謝)
- 運動記録 (距離・ペース・時間・カロリー・心拍数)
- 期間ダッシュボード — 週 / 月 / 年 / すべて の切替で集計とグラフ表示
- ダイエット開始日からの体組成差分・経過日数
- Nike Run Club のスクショから走行データを自動抽出してフォームに流し込む

## 技術スタック

| 領域 | 採用 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / React 19 / TypeScript |
| スタイル | Tailwind CSS v4 + デジタル庁デザインシステム (DADS) |
| 永続化 | Neon Postgres + Prisma 7 |
| バリデーション | zod |
| グラフ | recharts |
| 通知 | sonner |
| 画像認識 | Google Gemini API (`@google/genai`) |
| デプロイ | Vercel |

## 設計上のポイント

- **デジタル庁デザインシステム (DADS) 準拠** — 色・タイポ・角丸・影は DADS トークン経由のみ。生 hex やダークモードは持たない
- **モバイル優先 / WCAG 2.2 AA** — `max-w-screen-sm` の縦長レイアウト、フォーカスリング保持、タッチターゲット 44px 以上
- **PWA 前提** — iPhone のホーム画面追加で起動する前提で `viewportFit: cover` + `safe-area-inset` を設計
- **Server Component 中心** — データ取得は Server で、ミューテーションは Server Action。入力検証は server 側で zod
- **日付は UTC 統一** — Vercel が UTC 動作なので、JST 朝の境界ずれを避けるため [lib/format.ts](lib/format.ts) と [lib/summary.ts](lib/summary.ts) で UTC ベースに統一

詳細な実装規約は [AGENTS.md](AGENTS.md)、振る舞い仕様は [docs/spec.md](docs/spec.md) を参照。

## セットアップ

### 必要環境

- Node.js 20+
- Neon アカウント (Postgres)
- Google AI Studio API キー (画像認識を使う場合)

### 手順

```bash
git clone <repo-url>
cd diet-log
npm install
cp .env.example .env
# .env を編集して DATABASE_URL / POSTGRES_URL_NON_POOLING / GEMINI_API_KEY を設定
npm run db:migrate
npm run dev
```

`http://localhost:3000` を開く。スマホ実機確認は同一 LAN から `http://<PC の IP>:3000`。

### 環境変数

| 変数 | 用途 |
| --- | --- |
| `DATABASE_URL` | ランタイム DB 接続 (Neon の pooled URL) |
| `POSTGRES_URL_NON_POOLING` | Prisma マイグレーション用 (Neon の direct URL) |
| `GEMINI_API_KEY` | 画像認識 (https://aistudio.google.com/apikey で発行) |

## 開発コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー (Turbopack) |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番ビルドの起動 |
| `npm run lint` | ESLint |
| `npm run db:generate` | Prisma クライアント生成 |
| `npm run db:migrate` | マイグレーション実行 (dev) |
| `npm run db:studio` | Prisma Studio 起動 |

## ディレクトリ構成 (主要のみ)

```
app/                     # Next.js App Router
├── page.tsx             # ダッシュボード
├── workout/             # 運動記録一覧 + 削除 Action
├── body/                # 体組成一覧 + 削除 Action
├── entry/               # 登録フォーム + 画像認識 Action
└── actions.ts           # ダッシュボード用 Action (開始日)
components/
├── dashboard/           # ダッシュボードカード群 (期間切替・グラフ)
├── delete-confirm-dialog.tsx
├── record-card.tsx
└── bottom-tab-nav.tsx
lib/
├── db.ts                # Prisma クライアント + safeDb ラッパー
├── gemini.ts            # Gemini クライアント + Nike Run Club 認識
├── format.ts            # 表示用フォーマッター (UTC ベース)
├── summary.ts           # 期間集計・ナビゲーションロジック
├── settings.ts          # Setting テーブルのキー定数
└── cn.ts                # className 結合 (clsx + tailwind-merge)
prisma/
└── schema.prisma        # DB スキーマ (Workout / BodyComposition / Setting)
docs/
└── spec.md              # アプリの振る舞い仕様
```
