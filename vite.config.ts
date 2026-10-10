import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import url from 'url';

// Vite middleware plugin to execute api/*.ts serverless functions in local dev
function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      // Use unshift to place before Vite's static asset / transform middlewares
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = url.parse(req.url, true);
        const endpoint = parsedUrl.pathname?.replace('/api/', '').split('/')[0];

        try {
          // Resolve handler module from ./api/<endpoint>.ts
          const modulePath = path.resolve(__dirname, `api/${endpoint}.ts`);
          const handlerModule = await server.ssrLoadModule(modulePath);
          const handler = handlerModule.default || handlerModule;

          if (typeof handler !== 'function') {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `API endpoint '${endpoint}' handler not found` }));
            return;
          }

          // Handler execution helper
          const executeHandler = async (reqBody: any) => {
            const vercelReq: any = req;
            vercelReq.query = parsedUrl.query;
            vercelReq.body = reqBody;

            const vercelRes: any = res;
            vercelRes.status = (code: number) => {
              res.statusCode = code;
              return vercelRes;
            };
            vercelRes.json = (data: any) => {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(data));
              return vercelRes;
            };
            vercelRes.send = (data: any) => {
              if (!res.headersSent) {
                if (typeof data === 'object') {
                  res.setHeader('Content-Type', 'application/json');
                }
              }
              res.end(typeof data === 'object' ? JSON.stringify(data) : data);
              return vercelRes;
            };

            try {
              await handler(vercelReq, vercelRes);
            } catch (err: any) {
              console.error(`[API ERROR in /api/${endpoint}]:`, err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
              }
            }
          };

          if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
            await executeHandler({});
          } else {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              let parsedBody = {};
              if (body) {
                try {
                  parsedBody = JSON.parse(body);
                } catch {
                  parsedBody = body;
                }
              }
              await executeHandler(parsedBody);
            });
          }
        } catch (err: any) {
          console.error(`[API Route Load Error /api/${endpoint}]:`, err);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `API route /api/${endpoint} not found or failed to load`, details: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [apiServerPlugin(), vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Expose both VITE_ and NEXT_PUBLIC_ prefixed env vars to the frontend
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 3000,
    open: false
  }
});
