import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { departures } from '@/api/departures';

const app = new Hono();

// mount the /api/departures router under /api
app.route('/api', departures);

// simple health check
app.get('/', (c) => c.text('API is running.'));

const PORT = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`🚆 Server is running at http://localhost:${PORT}`);
});

app.notFound((c) => {
    return c.text('Route not found', 404);
});
