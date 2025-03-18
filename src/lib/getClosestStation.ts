import { closeDb, Config, getStops, getStopsAsGeoJSON } from 'gtfs';
import { TEST_COORDS } from './constants.js';
import { getConfig } from './utils.js';
import { loadDb } from '../db.js';

interface GeoCoordinate {
  lat?: number;
  lon?: number;
}

/**
 * Retrieves all transit stations from the GTFS stops table.
 * A transit station is defined as any stop that is referenced as a parent_station
 * by at least one other stop.
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getClosestStation = async ({ lat, lon }: GeoCoordinate = {}) => {
  const nearbyStations = getStops(
    {
      //   stop_lat: 53.542026,
      //   stop_lon: -113.506601,
      location_type: 1,
      stop_lat: lat,
      stop_lon: lon,
    },
    [],
    [],
    {
      bounding_box_side_m: 5000,
    },
  );

  const closestStation = nearbyStations[0];
  console.log(closestStation);

  return closestStation;
};

export const getStopsForParentStation = async (parent_station_id: string) => {
  const platforms = getStops({
    parent_station: parent_station_id,
    location_type: 0,
  });

  return platforms;
};

const main = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  const closestStation = await getClosestStation(TEST_COORDS);
  const closestStops = await getStopsForParentStation(closestStation.stop_id);
  console.log(closestStops);

  closeDb(db);
};

await main();
