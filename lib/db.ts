// Prisma クライアントのシングルトン + 共通エラーハンドラ
// Server Component / Server Action 専用 (server-only でクライアントへの混入を防ぐ)

import "server-only";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { Prisma, PrismaClient } from "./generated/prisma/client";

// Neon serverless driver は WebSocket ベース。Node ランタイムでは ws を注入する必要がある
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL が設定されていません");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// dev で HMR が走ると毎回 new されるのを防ぐため globalThis にキャッシュする
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Prisma 操作を try/catch で包み、エラーをユーザー向けメッセージに変換する
export async function safeDb<T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<DbResult<T>> {
  try {
    const data = await operation();
    return { ok: true, data };
  } catch (e) {
    console.error(`[db] ${context ?? "operation"} failed:`, e);
    return { ok: false, error: toUserMessage(e) };
  }
}

function toUserMessage(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case "P2002":
        return "同じデータがすでに登録されています";
      case "P2025":
        return "対象のデータが見つかりません";
      default:
        return "データベース処理でエラーが発生しました";
    }
  }
  if (e instanceof Prisma.PrismaClientValidationError) {
    return "入力データの形式が正しくありません";
  }
  return "予期しないエラーが発生しました";
}
