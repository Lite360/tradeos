import type { VercelRequest, VercelResponse } from '@vercel/node';

async function getRawBody(req: VercelRequest): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) {}
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        resolve({});
      }
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = await getRawBody(req);
  return res.status(200).json({
    method: req.method,
    headers: req.headers,
    body: body,
    rawType: typeof req.body
  });
}
