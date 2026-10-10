import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    const result = await pool.query('SELECT 1 as test, NOW() as time');
    await pool.end();
    return res.status(200).json({ success: true, rows: result.rows });
  } catch (err: any) {
    await pool.end().catch(() => { });
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
  }
}

