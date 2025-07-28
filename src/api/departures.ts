import { Hono } from 'hono';
import { getNearbyDepartures } from '@/lib/get-nearby-departures';

export const departures = new Hono().basePath('/departures');

/**
 * GET /api/departures/nearby?lat=…&lon=…
 */
departures.get('/nearby', async (c) => {
    const lat = parseFloat(c.req.query('lat') ?? '');
    const lon = parseFloat(c.req.query('lon') ?? '');

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return c.json({ error: 'Invalid latitude or longitude' }, 400);
    }

    try {
        const result = await getNearbyDepartures({ lat, lon });
        return c.json(result);
    } catch (err) {
        console.error('Error in /api/departures:', err);
        return c.json({ error: 'Failed to fetch departures' }, 500);
    }
});

departures.get('/:stopId', async (c) => {
    const stopId = c.req.param('stopId');
    return c.json(stopId);
});
