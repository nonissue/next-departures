import { closeDb } from 'gtfs';
import { loadDb } from './db.js';
import {
  getCurrentDate,
  getServiceDate,
  getServiceTime,
} from './lib/time-utils.js';
import { getConfig } from './lib/utils.js';
import { Config } from './types/global.js';
import { Database } from 'better-sqlite3';

async function getDepartureTimes(
  db: Database,
  stopId: string,
  targetDate?: string,
  targetTime?: string,
) {
  let queryDate;

  if (!targetDate) {
    queryDate = getServiceDate();
  } else {
    queryDate = targetDate;
  }

  let queryTime;
  if (!targetTime) {
    queryTime = getServiceTime();
  } else {
    queryTime = getServiceTime(targetTime);
  }

  const queryResults = db
    .prepare(
      `
        WITH ValidServices AS (
            SELECT service_id
            FROM calendar_dates
            WHERE date = ? AND exception_type = 1
        ),
        TripInstances AS (
            SELECT trips.trip_id, trips.service_id
            FROM trips
            INNER JOIN ValidServices ON trips.service_id = ValidServices.service_id
        )
        SELECT stop_times.departure_time, stop_times.trip_id, stop_times.stop_sequence
        FROM stop_times
        INNER JOIN TripInstances ON stop_times.trip_id = TripInstances.trip_id
        WHERE stop_times.stop_id = ?
        ORDER BY stop_times.departure_time;
    `,
    )
    .all([queryDate, stopId]);

  return queryResults;
}

const main = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  getDepartureTimes(db, '2114', '20250315').then(console.log);

  closeDb(db);
};

await main();

// Example usage
