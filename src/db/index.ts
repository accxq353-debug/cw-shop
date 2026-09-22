import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: ReturnType<typeof drizzle>;
};

export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !url.trim()) return undefined;
  return url.trim();
}

export function isLocalDb(url: string): boolean {
  return url.includes("localhost") || url.includes("127.0.0.1") || url.includes("host.docker.internal");
}

export function getPool(): Pool {
  if (globalForDb.__arenaNextJsPostgresqlPool) {
    return globalForDb.__arenaNextJsPostgresqlPool;
  }
  const url = getDatabaseUrl() || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
  
  // Neon, Supabase, Railway and AWS require SSL unless connecting locally.
  const poolInstance = new Pool({
    connectionString: url,
    ssl: isLocalDb(url) ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = poolInstance;
  }
  return poolInstance;
}

export function getDb(): ReturnType<typeof drizzle> {
  if (globalForDb.__arenaNextJsPostgresqlDb) {
    return globalForDb.__arenaNextJsPostgresqlDb;
  }
  const dbInstance = drizzle(getPool());
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlDb = dbInstance;
  }
  return dbInstance;
}

// Proxies so that all existing `import { db, pool } from "@/db"` statements continue to work seamlessly:
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const realPool = getPool();
    const value = (realPool as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(realPool) : value;
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const realDb = getDb();
    const value = (realDb as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(realDb) : value;
  },
});
