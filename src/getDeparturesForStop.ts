import { getStops, getStoptimes } from 'gtfs';
import { StopDepartures } from './types/global.js';

import {
  convertServiceTimeToClockTime,
  getCurrentDate,
} from './lib/time-utils.js';
import { getServiceDate, getServiceTime } from './lib/time-utils.js';

const VERBOSE_MODE = true;

/**
 * getDeparturesForStop
 * @param stopId - string - `node-gtfs` docs type this as string
 * @param targetTime - string (optional) - timestamp to run query at specific time
 * @param tripLookaheadIntervalMins - number - not implemented yet
 * @throws Error if stopId isn't provided
 * @returns Array of Stoptimes[] containn objects for each matching upcoming departures for specified stop at current time (or at targetTime, if provided)
 */
export const getDeparturesForStop = async (
  stopId: string,
  targetTime?: string,
  tripLookaheadIntervalMins: number = 60,
): Promise<StopDepartures[]> => {
  if (!stopId) throw new Error('stopId is required');

  const currentDate = getCurrentDate();

  const [currentServiceDate, currentServiceTime] = targetTime
    ? [getServiceDate({ targetTime }), getServiceTime(targetTime)]
    : [getServiceDate(), getServiceTime()];

  // if (VERBOSE_MODE) {
  //   console.log(
  //     `curr: ${currentDate} | Service: ${currentServiceTime} ${currentServiceDate}`,
  //   );
  // }

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

  const truncatedDepartures = departures.slice(0, 5);

  // retrieve human readable stopname for specified stop
  // this maybe shouldn't go here

  // move below to dedicated print/display function?
  // formatting and printing output is beyond the original scope
  if (VERBOSE_MODE) {
    const [stopName] = getStops({ stop_id: stopId });
    console.log('');
    // console.log(
    //   `\n${stopName.stop_name}\t(ID: ${stopId})\ncurrentDate:\t\t${currentDate}\nServiceDate:\t\t${currentServiceDate}\nServiceTime:\t\t${currentServiceTime}\n\n\n${'Direction'?.padEnd(25)} ${'DepartureTime'.padStart(20)} ${'Trip ID'?.padStart(15)}\n\n--------------------------------------------------------------`,
    // );

    truncatedDepartures.forEach((entry) => {
      const { stop_headsign, departure_time, trip_id } = entry;
      console.log(
        `${stop_headsign?.padEnd(25)} ${convertServiceTimeToClockTime(departure_time as string)?.padStart(20)} ${trip_id?.padStart(15)}`,
      );
    });
  }

  return departures;
};
