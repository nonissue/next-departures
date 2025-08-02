import { Hono } from 'hono';
import { getNearbyDepartures } from '@/lib/get-nearby-departures';
import { getDeparturesForStop } from '@/lib/stop-utils';
import { getConfig } from '@/lib/file-utils';
import { loadDb } from '@/lib/db-utils';
import { Config } from '@/types/global';
import { closeDb } from 'gtfs';

export const departures = new Hono().basePath('/departures');

/**
 * GET /api/departures/nearby?lat=…&lon=…
 */
departures.get('/nearby', async (c) => {
    const config: Config = await getConfig();
    const db = await loadDb(config);

    const lat = parseFloat(c.req.query('lat') ?? '');
    const lon = parseFloat(c.req.query('lon') ?? '');

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        closeDb(db);
        return c.json({ error: 'Invalid latitude or longitude' }, 400);
    }

    try {
        const result = await getNearbyDepartures({ lat, lon });

        closeDb(db);

        return c.json(result);
    } catch (err) {
        closeDb(db);

        console.error('Error in /api/departures:', err);

        return c.json({ error: 'Failed to fetch departures' }, 500);
    }
});

departures.get('/:stopId', async (c) => {
    const config: Config = await getConfig();
    const db = await loadDb(config);

    const stopId = c.req.param('stopId');

    const result = await getDeparturesForStop(stopId, '08:00:00', 60);

    closeDb(db);
    return c.json(result);
});
