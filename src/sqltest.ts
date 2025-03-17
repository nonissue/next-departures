import { closeDb } from 'gtfs';
import { loadDb } from './db.js';
import { getServiceDate, getServiceTime } from './lib/new-time-utils.js';
import { getTransitStations } from './lib/getTransitStations.js';
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
            SELECT trips.trip_id, trips.service_id, trips.direction_id, trips.route_id
            FROM trips
            INNER JOIN ValidServices ON trips.service_id = ValidServices.service_id
        )
        -- SELECT stop_times.departure_time, stop_times.trip_id, stop_times.stop_sequence
        -- SELECT stop_times.departure_time, stop_times.trip_id, stop_times.stop_sequence, service_id
        SELECT *
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

  const trainStations = await getTransitStations(db);
  trainStations.forEach((entry) => {
    const { stop_id, stop_name, parent_station } = entry;
    console.log(
      `${stop_name?.padEnd(35)} ${parent_station?.padStart(20)} ${stop_id?.padStart(15)}`,
    );
  });
  // getDepartureTimes(db, '2114', '20250315').then(console.log);

  closeDb(db);
};

await main();

// Example usage
