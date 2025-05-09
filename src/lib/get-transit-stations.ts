import { Database } from 'better-sqlite3';
import { Config, Stop } from 'gtfs';
import { getConfig } from './utils.js';
import { loadDb } from './db-utils.js';

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

const currentTime = new Date();
const config: Config = await getConfig();
const db = await loadDb(config);

const allTransitStations = getTransitStations(db);
console.log(allTransitStations.length);

// console.log(Array.isArray(allTransitStations));
// console.log(JSON.stringify(allTransitStations));
