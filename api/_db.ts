import { Pool } from 'pg';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

export function getFreshPool(): Pool {
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    max: 1
  });
}

export const pool = getFreshPool();

export async function query(text: string, params?: any[]) {
  const p = getFreshPool();
  try {
    const res = await p.query(text, params);
    await p.end().catch(() => {});
    return res;
  } catch (err: any) {
    await p.end().catch(() => {});
    console.error('[Postgres Query Error]', { text, params, err: err.message });
    throw err;
  }
}
