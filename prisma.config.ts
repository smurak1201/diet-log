// Prisma 7 ではマイグレーション用 DB 接続をここに書く (schema.prisma からは廃止)
// Neon の direct (非プール) URL を使う — pgbouncer 経由だとマイグレーションが失敗するため

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("POSTGRES_URL_NON_POOLING"),
  },
});
