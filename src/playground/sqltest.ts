import { closeDb } from 'gtfs';
import { loadDb } from '../db.js';
import { getServiceDate, getServiceTime } from '../lib/time-utils.js';
import { getTransitStations } from '../lib/stop-utils.js';
import { getConfig } from '../lib/utils.js';
import { Config } from '../types/global.js';
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

  const printTrainStations = async () => {
    console.log(
      `\n┌───────────────────────── λ ──────────────────────────┐\n│                                                      │\n│   function - getTrainStations()                      │\n│   description - get all light rail stations (GTFS)   │\n│                                                      │\n└──────────────────────────────────────────────────────┘\n\n${('' + '').padStart(2)}  ${'stop_name'.padEnd(35)} ${'stop_id'?.padStart(15)}\n    ┄┄┄┄┄┄┄┄┄                                   ┄┄┄┄┄┄┄`,
    );
    let inc = 1;
    trainStations.forEach((entry) => {
      const { stop_id, stop_name } = entry;

      console.log(
        `${(inc + '').padStart(2)}. ${stop_name?.padEnd(35)} ${stop_id?.padStart(15)}`,
      );

      inc = inc + 1;
    });

    closeDb(db);
  };

  await printTrainStations();
};

await main();

// Example usage
