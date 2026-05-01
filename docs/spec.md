# アプリ仕様 (diet-log)

このドキュメントはアプリの振る舞いに関する仕様を集約する。スキーマ定義は [prisma/schema.prisma](../prisma/schema.prisma) を single source of truth とし、ここでは**コードだけでは伝わらない振る舞い・運用ルール**を残す。

---

## 記録対象データ

| 種別 | 項目 |
| --- | --- |
| 運動 | 日時 / 距離 (km) / 平均ペース (秒/km) / 時間 (秒) / 消費カロリー (kcal) / 平均心拍数 (bpm) |
| 体組成 | 日付 / 体重 (kg) / BMI / 体脂肪率 (%) / 筋肉量 (kg) / 内臓脂肪 / 基礎代謝 (kcal) |

## データモデルの振る舞い

### 運動記録 (`Workout`)

- **粒度は「年月日時分」** — 同じ日に複数回走ることがあるため、日付ではなく日時で記録する。
  - DB 型: `TIMESTAMP(0)` (秒・ミリ秒は切り捨て)
  - 入力 UI: `<input type="datetime-local">` を想定。Server Action で `new Date(value)` して保存
- 1 日に複数件登録可。一覧では `date` の降順で表示する想定
- **同じ時分での重複登録は禁止** — 同一人物が同じ分に 2 回走り始めることは現実的にないため、`date` に `@unique` を付ける。重複時は P2002 エラー → 「同じデータがすでに登録されています」を返す

### 体組成記録 (`BodyComposition`)

- **1 日 1 件** — 同じ日付の登録は**上書き** (upsert) する。朝計測 → 夜に再計測したら最新値で置き換える運用
  - DB 制約: `date` に `@unique`
  - 実装: `prisma.bodyComposition.upsert({ where: { date }, update: {...}, create: { date, ...} })`
- 粒度は日付 (`@db.Date`)。時刻情報は持たない

### アプリ設定 (`Setting`)

- **key/value の汎用ストア** — 単一ユーザー前提のため `key` を主キーにする (auth 導入時に `@@unique([userId, key])` への拡張を想定)
- 値は文字列 (`String`) で持つ。日付なら `YYYY-MM-DD` の文字列で格納
- 現状のキー: `dietStartDate` (ダイエット開始日 — ホーム画面の「経過日数」基準)。キー名は [lib/settings.ts](../lib/settings.ts) の `SETTING_KEYS` に集約

---

## 画面構成

下部タブで以下 4 画面を切り替える (URL は分離)。

| URL | 画面 | 概要 |
| --- | --- | --- |
| `/` | ホーム | ダイエット開始日からの経過日数 / 期間 (週・月・年・すべて) の活動サマリ・体組成差分 / 推移グラフ |
| `/workout` | 運動記録 | 運動記録の一覧 + 期間 (週・月・年・すべて) の活動サマリ |
| `/body` | 体組成 | 体組成記録の一覧 + 期間 (週・月・年・すべて) の体組成差分・推移グラフ |
| `/entry` | データ登録 | 運動 (画像認識 / 手入力) と体組成の入力フォーム入口 |

### 期間切替 (週 / 月 / 年 / すべて) の挙動

- 切替は **クライアント state** ([components/dashboard/use-range-state.ts](../components/dashboard/use-range-state.ts)) で管理。**URL には反映しない** (PWA で再読込のたびにリセットされる UX を許容)
- 初期値は `type: "month"`、基準日は今日 (JST)
- カードごとに独立した state を持つ (例: ホームの「活動」と「体組成差分」は別々に切替可能)
- 「前へ / 次へ」ナビでは基準日を移動して過去の期間も閲覧できる。`すべて` は範囲固定で前後ナビは出ない

---

## 画像認識による運動記録の取り込み

`/entry` の運動入力フォームでは、Nike Run Club の結果画面スクリーンショットから走行データを自動抽出して入力欄を埋める動線を提供する。手入力も従来どおり可能。

- **対応元**: Nike Run Club の結果画面スクリーンショット (日本語 UI)
- **抽出項目**: 日時 / 距離 (km) / 平均ペース (秒/km) / 時間 (秒) / 消費カロリー (kcal) / 平均心拍数 (bpm)
  - 日時は画面の「今日 - HH:mm」「N日前 - HH:mm」「<曜日> - HH:mm」「<月>月<日>日 - HH:mm」表記を Asia/Tokyo の絶対日時に解決する (常に過去日付になる)
  - 心拍が表示されないアクティビティ等、読み取れない項目は `null` を返す。**推測値は入れない**
- **動作フロー**: 画像選択 → Gemini で抽出 → フォームに自動入力 → ユーザー確認・必要なら修正 → 登録ボタンで `createWorkout` 実行
- **対応 MIME**: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif` (iPhone の HEIC/HEIF を直接受け付ける)
- **サイズ上限**: 8MB
- **利用上限**: Gemini 無料枠 (`gemini-2.5-flash` で 10 RPM / 20 RPD)。超過時 (429) は専用メッセージで手入力を案内

## 起動形態

- **iPhone のホーム画面に追加して PWA として起動する前提**で設計する (ブラウザでも動くが、UX はホーム画面アプリ起動時を主軸に最適化)
- スタンドアロン表示 (`apple-mobile-web-app-capable`) のため Safari の UI (アドレスバー / 更新ボタン) は出ない。再読込が必要な操作は Server Action + `revalidatePath` で吸収する設計にする
- ホームインジケータ領域は `viewportFit: "cover"` + `env(safe-area-inset-bottom)` で回避済み
