// src/api/departures.ts
import express from 'express';
import { getNearbyDepartures } from '@/lib/get-nearby-departures';

const router = express.Router();

router.get('/api/departures', async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    try {
        const nearbyDeparturesResult = await getNearbyDepartures({ lat, lon });
        res.json(nearbyDeparturesResult);
    } catch (error) {
        console.error('Error in /api/departures:', error);
        res.status(500).json({ error: 'Failed to fetch departures' });
    }
});

export default router;
