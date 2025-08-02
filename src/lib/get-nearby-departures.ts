import { GeoCoordinate } from '@/types/global';
import { TEST_COORDS } from '@/lib/constants';
import {
    getClosestStation,
    getStopsForParentStation,
    getDeparturesForStop,
} from '@/lib/stop-utils';

export const getNearbyDepartures = async ({ lat, lon }: GeoCoordinate = {}) => {
    if (!lat || !lon) {
        throw new Error('lat & lon are required to find nearby departures');
    }

    const currentTime = new Date();

    console.log(`DEV MODE  | ${currentTime}`);

    let closestStation;
    if (!lat || !lon) {
        console.log('WARNING: GPS OORDS HARDCODED FOR DEV');
        closestStation = await getClosestStation(TEST_COORDS);
    } else {
        console.log('NOTE: using provided LAT/LON');
        closestStation = await getClosestStation({ lat, lon });
    }

    const [platformA, platformB] = await getStopsForParentStation(
        closestStation.stop_id
    );

    const [departuresA, departuresB] = await Promise.all([
        getDeparturesForStop(platformA.stop_id),
        getDeparturesForStop(platformB.stop_id),
    ]);

    const result = {
        closestStation: closestStation,
        departures: [[...departuresA], [...departuresB]],
    };

    return result;
};
