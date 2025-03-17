import { Database } from 'better-sqlite3';

export interface Stop {
  stop_id: string;
  stop_name: string;
  parent_station?: string;
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
  const queryResults = db
    .prepare(
      `
      SELECT *
      FROM stops
      WHERE stop_id IN (
        SELECT DISTINCT parent_station
        FROM stops
        WHERE parent_station IS NOT NULL
      )
    `,
    )
    .all();

  return queryResults as Stop[];
};
