import { Config, getStops, Stop } from 'gtfs';
import { GeoCoordinate } from '../types/global.js';
import { STATION_SEARCH_BOUNDING_BOX_AREA } from '../config.js';
import { TEST_COORDS } from './constants.js';
import { getConfig } from './utils.js';
import { loadDb } from './db-utils.js';

/**
 * Retrieves closest "station" from GTFS stops.
 * A "station" is a stop with `location_type=1`
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getNearestStation = async ({
    lat,
    lon,
}: GeoCoordinate = {}): Promise<Stop> => {
    const currentTime = new Date();
    // const config: Config = await getConfig();

    // const db = await loadDb(config);

    const nearbyStations = getStops(
        {
            location_type: 1,
            stop_lat: lat,
            stop_lon: lon,
        },
        [],
        [],
        {
            bounding_box_side_m: STATION_SEARCH_BOUNDING_BOX_AREA,
        }
    );

    return nearbyStations[0];
};

// const testStation = await getNearestStation(TEST_COORDS);
// console.log(testStation);
