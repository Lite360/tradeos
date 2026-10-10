import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const result = await query('SELECT NOW() as now, version() as version;');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    return res.status(200).json({
      status: 'healthy',
      database: 'Neon PostgreSQL (Connected)',
      timestamp: result.rows[0]?.now,
      version: result.rows[0]?.version,
      tables: tables.rows.map(r => r.table_name)
    });
  } catch (err: any) {
    console.error('Neon Health check error:', err);
    return res.status(500).json({
      status: 'error',
      database: 'Neon PostgreSQL (Connection Failed)',
      error: err.message
    });
  }
}
