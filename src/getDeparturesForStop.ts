import { getStops, getStoptimes } from 'gtfs';

import {
  convertServiceTimeToClockTime,
  getCurrentDate,
  getCurrentServiceDate,
  getCurrentServiceTime,
} from './lib/time-utils.js';

const VERBOSE_MODE = false;

/**
 * Validates the configuration object for GTFS import
 * @param stopId - string - `node-gtfs` docs type this as string
 * @throws Error if stopId isn't provided
 * @returns Nothing
 */
export const getDeparturesForStop = async (
  stopId: string,
  tripLookaheadIntervalMins: number = 60,
) => {
  const currentDate = getCurrentDate();
  const currentServiceTime = getCurrentServiceTime();
  const currentServiceDate = getCurrentServiceDate();

  const departures = getStoptimes(
    {
      stop_id: stopId,
      date: currentServiceDate,
      // start_time: '10:00:00',
      start_time: currentServiceTime,
      // end_time: '10:20:00',
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );

  // retrieve human readable stopname for specified stop
  // this maybe shouldn't go here

  // const stopName = { stop_name: 'N/A' };

  // move below to dedicated print/display function?
  // formatting and printing output is beyond the original scope
  if (VERBOSE_MODE) {
    const [stopName] = getStops({ stop_id: stopId });
    console.log(
      `\n${stopName.stop_name}\t(ID: ${stopId})\nCurrent Date:\t\t${currentDate}\nServiceDate:\t\t${currentServiceDate}\nServiceTime:\t\t${currentServiceTime}\n\n\n${'Direction'?.padEnd(25)} ${'DepartureTime'.padStart(20)} ${'Trip ID'?.padStart(15)}\n\n--------------------------------------------------------------`,
    );

    departures.forEach((entry) => {
      const { stop_headsign, departure_time, trip_id } = entry;
      console.log(
        `${stop_headsign?.padEnd(25)} ${convertServiceTimeToClockTime(departure_time as string)?.padStart(20)} ${trip_id?.padStart(15)}`,
      );
    });
    console.log('\n');
  }

  return departures;
};
