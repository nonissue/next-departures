import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'path';
import { fileURLToPath } from 'url';

import { departures } from './api/departures.js';

const app = new Hono();

// Path setup for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientPath = path.join(__dirname, '../dist/client');

// Serve static files from Vite build
app.use(
    '*',
    serveStatic({
        root: clientPath,
        rewriteRequestPath: (p) => (p === '/' ? '/index.html' : p),
    })
);

// mount the /api/departures router under /api
app.route('/api', departures);

// simple health check
// app.get('/', (c) => c.text('API is running.'));

app.notFound((c) => {
    return c.text(`Route not found ${c.req.path}`, 404);
});

app.onError((err, c) => {
    console.error(`${err}`);
    return c.text('Custom Error Message', 500);
});

const PORT = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`🚆 Server is running at http://localhost:${PORT}`);
});
