// src/api/departures.ts
import express from 'express';
import { Config, openDb } from 'gtfs';
import { importGtfsDataToDb, loadDb } from '@/lib/db-utils';
import { getNearbyDepartures } from '@/lib/get-nearby-departures';
import { getConfig } from '@/lib/utils';

const router = express.Router();

router.get('/api/departures', async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    try {
        const currentTime = new Date();
        const config: Config = await getConfig();
        const db = await loadDb(config);

        const nearbyDeparturesResult = await getNearbyDepartures({ lat, lon });

        // const station = await getNearestStation({ lat, lon });
        // const stops = await getStopsForParentStation(station.stop_id);

        // const allDepartures = [];

        // for (const stop of stops) {
        //     const departures = await getDeparturesForStop(stop.stop_id);
        //     for (const dep of departures) {
        //         allDepartures.push({
        //             time: dep.departure_time,
        //             destination: dep.stop_headsign,
        //         });
        //     }
        // }

        // allDepartures.sort((a, b) => a.time.localeCompare(b.time));

        res.json(nearbyDeparturesResult);

        // res.json());
    } catch (error) {
        console.error('Error in /api/departures:', error);
        res.status(500).json({ error: 'Failed to fetch departures' });
    }
});

export default router;
