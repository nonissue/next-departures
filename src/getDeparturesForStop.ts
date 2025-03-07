import { closeDb, getStoptimes } from 'gtfs';
import { loadDb } from './db.js';
import { Config } from './types/global.js';
import { getConfig } from './utils.js';
import {
  convertServiceTimeToClockTime,
  getCurrentServiceDate,
  getCurrentServiceTime,
  getStartAndStopTimeFormatted,
} from './lib/time-utils.js';

const openRunClose = async (funcToRun: Function) => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  funcToRun();

  closeDb(db);
};

/**
 * Validates the configuration object for GTFS import
 * @param stopId - string - `node-gtfs` docs type this as string
 * @throws Error if stopId isn't provided
 * @returns Nothing
 */
export const getDeparturesForStop = (
  stopId: string,
  tripLookaheadIntervalMins: number = 60,
) => {
  const currentServiceTime = getCurrentServiceTime();
  const currentServiceDate = getCurrentServiceDate();

  console.log(currentServiceDate);
  console.log(currentServiceTime);

  let departures;

  departures = getStoptimes(
    {
      stop_id: stopId, // Corona Southbound
      date: currentServiceDate,
      start_time: currentServiceTime,
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );

  departures.forEach((entry) => {
    const { stop_headsign, departure_time, trip_id } = entry;
    console.log(
      `${trip_id?.padEnd(10)} ${stop_headsign?.padEnd(30)} ${convertServiceTimeToClockTime(departure_time as string)?.padStart(10)}`,
    );
  });
};
