import { getStoptimes } from 'gtfs';
import { StopDepartures } from '../types/global.js';
import { getServiceDate, getServiceTime } from './time-utils.js';

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

  const [currentServiceDate, currentServiceTime] = targetTime
    ? [getServiceDate({ targetTime }), getServiceTime(targetTime)]
    : [getServiceDate(), getServiceTime()];

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

  return departures;
};
