import { closeDb } from 'gtfs';
import { loadDb } from './db-utils.js';
import { Config, GeoCoordinate } from '@/types/global.js';
import { TEST_COORDS } from './constants.js';
import { getClosestStation, getStopsForParentStation } from './stop-utils.js';
import { getConfig } from './utils.js';
import { getDeparturesForStop } from './get-departures-for-stop.js';

export const getNearbyDepartures = async ({ lat, lon }: GeoCoordinate = {}) => {
    const currentTime = new Date();
    const config: Config = await getConfig();
    const db = await loadDb(config);

    console.log(`DEV MODE  | ${currentTime}`);

    let closestStation;

    if (!lat || !lon) {
        console.log('WARNING: GPS OORDS HARDCODED FOR DEV');
        closestStation = await getClosestStation(TEST_COORDS);
    } else {
        console.log('NOTE: using provided LAT/LON');
        closestStation = await getClosestStation({ lat, lon });
    }

    // console.log(`Closest station is: ${closestStation.stop_name}`);

    const [platformA, platformB] = await getStopsForParentStation(
        closestStation.stop_id
    );

    const departuresA = (await getDeparturesForStop(platformA.stop_id)).slice(
        0,
        5
    );
    const departuresB = (await getDeparturesForStop(platformB.stop_id)).slice(
        0,
        5
    );

    closeDb(db);

    const result = {
        closestStation: closestStation,
        departures: [[...departuresA], [...departuresB]],
    };

    // const result = [[...departuresA], [...departuresB]];

    return result;
};

// const test = await getNearbyDepartures();
// console.log(test);
// printDepartures(test);
