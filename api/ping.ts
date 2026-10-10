import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return res.status(200).json({
      status: 'ok',
      message: 'Serverless function ping working',
      envKeys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')),
      nodeVersion: process.version
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
