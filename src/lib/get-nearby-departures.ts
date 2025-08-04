import { GeoCoordinate } from '../types/global.js';
import { TEST_COORDS, TEST_COORDS_FAR } from '../config.js';
import {
    getClosestStation,
    getStopsForParentStation,
    getDeparturesForStop,
} from '../lib/stop-utils.js';

export const getNearbyDepartures = async ({ lat, lon }: GeoCoordinate = {}) => {
    if (!lat || !lon) {
        throw new Error('lat & lon are required to find nearby departures');
    }

    let closestStation;
    if (!lat || !lon) {
        closestStation = await getClosestStation(TEST_COORDS);
    } else {
        closestStation = await getClosestStation({ lat, lon });
        // closestStation = await getClosestStation(TEST_COORDS_FAR);
        console.log(closestStation.stop_id);
    }

    const stops = await getStopsForParentStation(closestStation.stop_id);

    const departures = await Promise.all(
        stops.map((stop) => getDeparturesForStop({ stopId: stop.stop_id }))
    );

    // const [departuresA, departuresB] = await Promise.all([
    //     getDeparturesForStop({ stopId: platformA.stop_id }),
    //     getDeparturesForStop({ stopId: platformB.stop_id }),
    // ]);

    const [departuresA, departuresB] = [
        departures[0] ?? [],
        departures[1] ?? [],
    ];

    const result = {
        closestStation: closestStation,
        departures: [[...departuresA], [...departuresB]],
    };

    return result;
};
