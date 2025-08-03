import { GeoCoordinate } from '../types/global.js';
import { TEST_COORDS } from '../config.js';
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
    }

    const [platformA, platformB] = await getStopsForParentStation(
        closestStation.stop_id
    );

    const [departuresA, departuresB] = await Promise.all([
        getDeparturesForStop({ stopId: platformA.stop_id }),
        getDeparturesForStop({ stopId: platformB.stop_id }),
    ]);

    const result = {
        closestStation: closestStation,
        departures: [[...departuresA], [...departuresB]],
    };

    return result;
};
