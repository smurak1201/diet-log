# アプリ仕様 (diet-log)

このドキュメントはアプリの振る舞いに関する仕様を集約する。スキーマ定義は [prisma/schema.prisma](../prisma/schema.prisma) を single source of truth とし、ここでは**コードだけでは伝わらない振る舞い・運用ルール**を残す。

---

## 記録対象データ

| 種別 | 項目 |
| --- | --- |
| 運動 | 日時 / 距離 (km) / 平均ペース (秒/km) / 時間 (秒) / 消費カロリー (kcal) / 平均心拍数 (bpm) |
| 体組成 | 日付 / 体重 (kg) / 体脂肪率 (%) / 筋肉量 (kg) / 内臓脂肪 / 基礎代謝 (kcal) |

## データモデルの振る舞い

### 運動記録 (`Workout`)

- **粒度は「年月日時分」** — 同じ日に複数回走ることがあるため、日付ではなく日時で記録する。
  - DB 型: `TIMESTAMP(0)` (秒・ミリ秒は切り捨て)
  - 入力 UI: `<input type="datetime-local">` を想定。Server Action で `new Date(value)` して保存
- 1 日に複数件登録可。一覧では `date` の降順で表示する想定

### 体組成記録 (`BodyComposition`)

- **1 日 1 件** — 同じ日付の登録は**上書き** (upsert) する。朝計測 → 夜に再計測したら最新値で置き換える運用
  - DB 制約: `date` に `@unique`
  - 実装: `prisma.bodyComposition.upsert({ where: { date }, update: {...}, create: { date, ...} })`
- 粒度は日付 (`@db.Date`)。時刻情報は持たない
