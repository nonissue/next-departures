import { getStops, getStoptimes } from 'gtfs';

import {
  convertServiceTimeToClockTime,
  getCurrentServiceDate,
  getCurrentServiceTime,
} from './lib/time-utils.js';

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

  let departures;

  departures = getStoptimes(
    {
      stop_id: stopId,
      date: currentServiceDate,
      start_time: currentServiceTime,
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );

  // retrieve human readable stopname for specified stop
  // this maybe shouldn't go here
  const [stopName] = getStops({ stop_id: stopId });

  // move below to dedicated print/display function?
  // formatting and printing output is beyond the original scope
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
