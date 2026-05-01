// 体組成記録の初回バルク登録 (2026-04-20 〜 2026-05-01)
// 使い方: npx tsx --env-file=.env scripts/seed-body.ts
//
// - 同じ日付のレコードがあれば upsert で上書き (再実行しても安全)
// - lib/db.ts は `import "server-only"` のため Node 単独では動かないので、ここでは Prisma を直接初期化する

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../lib/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

type Row = {
  date: string;
  weightKg: number;
  bmi: number;
  bodyFatPct: number;
  muscleMassKg: number;
  visceralFat: number;
  basalMetabolism: number;
};

const ROWS: Row[] = [
  { date: "2026-04-20", weightKg: 78.0, bmi: 28.4, bodyFatPct: 26.2, muscleMassKg: 54.8, visceralFat: 13.5, basalMetabolism: 1626 },
  { date: "2026-04-22", weightKg: 77.8, bmi: 28.2, bodyFatPct: 25.5, muscleMassKg: 55.0, visceralFat: 13.0, basalMetabolism: 1629 },
  { date: "2026-04-24", weightKg: 78.3, bmi: 28.4, bodyFatPct: 25.9, muscleMassKg: 55.1, visceralFat: 13.5, basalMetabolism: 1633 },
  { date: "2026-04-25", weightKg: 78.1, bmi: 28.3, bodyFatPct: 25.3, muscleMassKg: 55.3, visceralFat: 13.0, basalMetabolism: 1640 },
  { date: "2026-04-27", weightKg: 78.2, bmi: 28.4, bodyFatPct: 26.0, muscleMassKg: 54.9, visceralFat: 13.5, basalMetabolism: 1628 },
  { date: "2026-04-28", weightKg: 78.4, bmi: 28.5, bodyFatPct: 25.1, muscleMassKg: 55.7, visceralFat: 13.5, basalMetabolism: 1652 },
  { date: "2026-04-29", weightKg: 78.7, bmi: 28.6, bodyFatPct: 25.6, muscleMassKg: 55.5, visceralFat: 13.5, basalMetabolism: 1648 },
  { date: "2026-04-30", weightKg: 77.7, bmi: 28.2, bodyFatPct: 26.4, muscleMassKg: 54.2, visceralFat: 13.5, basalMetabolism: 1608 },
  { date: "2026-05-01", weightKg: 77.9, bmi: 29.0, bodyFatPct: 26.3, muscleMassKg: 54.4, visceralFat: 13.5, basalMetabolism: 1615 },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL が設定されていません");

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const row of ROWS) {
      const { date: dateStr, ...metrics } = row;
      const date = new Date(`${dateStr}T00:00:00Z`);
      await prisma.bodyComposition.upsert({
        where: { date },
        create: { date, ...metrics },
        update: metrics,
      });
      console.log(`✓ ${dateStr} (体重 ${metrics.weightKg}kg)`);
    }
    console.log(`\n${ROWS.length} 件登録しました`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
