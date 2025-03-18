import { Database } from 'better-sqlite3';

export interface Stop {
  stop_id: string;
  stop_name: string;
  parent_station?: string;
  stop_lat: number;
  stop_lon: number;
  // other stop properties...
}

/**
 * Retrieves all transit stations from the GTFS stops table.
 * A transit station is defined as any stop that is referenced as a parent_station
 * by at least one other stop.
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getTransitStations = async (db: Database): Promise<Stop[]> => {
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
