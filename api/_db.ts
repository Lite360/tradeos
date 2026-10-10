import { Pool } from 'pg';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Neon SQL]', { text, duration, rows: res.rowCount });
  }
  return res;
}
