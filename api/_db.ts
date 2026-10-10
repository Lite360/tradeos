import { Pool } from 'pg';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Reusable serverless Pool
let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 5
    });
    poolInstance.on('error', (err) => {
      console.error('[pg-pool-error]', err);
    });
  }
  return poolInstance;
}

export const pool = getPool();

export async function query(text: string, params?: any[]) {
  const p = getPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Postgres Query]', { text: text.trim().split('\n')[0], duration, rows: res.rows?.length || 0 });
    }
    return res;
  } catch (err: any) {
    console.error('[Postgres Query Error]', { text, params, err: err.message });
    throw err;
  }
}
