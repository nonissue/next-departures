import { getStops, getStoptimes } from 'gtfs';
import { StopDepartures } from './types/global.js';

import {
  convertServiceTimeToClockTime,
  getCurrentDate,
  getServiceDate,
  getServiceTime,
} from './lib/time-utils.js';

const VERBOSE_MODE = false;

/**
 * Validates the configuration object for GTFS import
 * @param stopId - string - `node-gtfs` docs type this as string
 * @throws Error if stopId isn't provided
 * @returns upcoming departures for specified stop
 */
export const getDeparturesForStop = async (
  stopId: string,
  targetTime?: string,
  tripLookaheadIntervalMins: number = 60,
): Promise<StopDepartures[]> => {
  let currentServiceTime, currentServiceDate;

  if (targetTime) {
    console.log('targetTime provided');

    // currentDate = getCurrentDate();
    currentServiceTime = getServiceTime(targetTime);
    currentServiceDate = getServiceDate();
    // currentServiceDate = getServiceDate();
  } else {
    // currentDate = getCurrentDate();
    currentServiceTime = getServiceTime();
    // currentServiceDate = getServiceDate();
  }
  const currentDate = getCurrentDate();

  console.log(
    `curr: ${currentDate} | Service: ${currentServiceTime} ${currentServiceDate}`,
  );

  const departures = getStoptimes(
    {
      stop_id: stopId,
      date: currentServiceDate,
      start_time: currentServiceTime,
    },
    [
      'stop_id',
      'trip_id',
      'stop_headsign',
      'departure_time',
      'departure_timestamp',
    ],
    [['departure_time', 'ASC']],
  ) as StopDepartures[];

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
