import { closeDb, getStops, getStoptimes } from 'gtfs';
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

  // console.log(currentServiceDate);
  // console.log(currentServiceTime);

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

  const [stopName] = getStops({ stop_id: stopId });
  // console.log(stopName);

  console.log(
    `\n${stopName.stop_name}\t(ID: ${stopId})\nServiceTime:\t\t${currentServiceTime}\nServiceDate:\t\t${currentServiceDate}\n\n${'DepartureTime'.padEnd(20)} ${'Direction'?.padStart(25)} ${'Trip ID'?.padStart(15)}\n\n--------------------------------------------------------------`,
  );
  departures.forEach((entry) => {
    const { stop_headsign, departure_time, trip_id } = entry;
    console.log(
      `${convertServiceTimeToClockTime(departure_time as string)?.padEnd(20)} ${stop_headsign?.padStart(25)} ${trip_id?.padStart(15)}`,
    );
  });
  console.log('');
};
