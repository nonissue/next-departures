import { Database } from 'better-sqlite3';
import { getStops, Stop } from 'gtfs';
import { GeoCoordinate } from '../types/global.js';

/**
 * Retrieves all transit stations from the GTFS stops table.
 * A transit station is defined as any stop that is referenced as a parent_station
 * by at least one other stop.
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getTransitStations = (db: Database): Stop[] => {
  const stations = `
    SELECT *
    FROM stops
    WHERE location_type = 1
    ORDER BY stops.stop_name;
  `;

  let queryToRun = stations;
  const queryResults = db.prepare(queryToRun).all();

  return queryResults as Stop[];
};

/**
 * Retrieves all transit stations from the GTFS stops table.
 * A transit station is defined as any stop that is referenced as a parent_station
 * by at least one other stop.
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getClosestStation = ({ lat, lon }: GeoCoordinate = {}): Stop => {
  const nearbyStations = getStops(
    {
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

  return nearbyStations[0];
};

export const getStopsForParentStation = (parent_station_id: string): Stop[] => {
  const platforms = getStops({
    parent_station: parent_station_id,
    location_type: 0,
  });

  return platforms;
};

// const main = async () => {
//   const config: Config = await getConfig();

//   const db = await loadDb(config);

//   const closestStation = await getClosestStation(TEST_COORDS);
//   const closestStops = await getStopsForParentStation(closestStation.stop_id);
//   console.log(closestStops);

//   closeDb(db);
// };

// await main();
