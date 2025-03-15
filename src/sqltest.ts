import { closeDb } from 'gtfs';
import { loadDb } from './db.js';
import { getCurrentDate } from './lib/time-utils.js';
import { getConfig } from './lib/utils.js';
import { Config } from './types/global.js';

async function getDepartureTimes(db: any, stopId: string, targetDate?: string) {
  let testDate;
  if (!targetDate) {
    testDate = getCurrentDate();
  } else {
    testDate = targetDate;
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
    .all([testDate, stopId]);

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
