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
export const TRASHgetDeparturesForStop = async (stopId: string) => {
  if (!stopId) {
    throw new Error('stopId is required!');
  }

  const tripLookaheadIntervalMins = 60;
  const currentServiceDate = getCurrentServiceDate();

  const formattedTimes = getStartAndStopTimeFormatted(
    tripLookaheadIntervalMins,
  );

  let departuresForStop;

  departuresForStop = getStoptimes(
    {
      stop_id: '1891', // Corona Southbound
      date: currentServiceDate,
      start_time: formattedTimes.start,
      end_time: formattedTimes.end,
      // end_time: '25:59:59',
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );
  console.log(departuresForStop.length);

  if (departuresForStop.length == 0) {
    console.log('TRYING AGAIN');
    departuresForStop = getStoptimes(
      {
        stop_id: '1891', // Corona Southbound
        date: 20250304,
        start_time: formattedTimes.start,
        end_time: formattedTimes.end,
        // end_time: '25:59:59',
      },
      ['trip_id', 'stop_headsign', 'departure_time'],
      [['departure_time', 'ASC']],
    );
  }

  console.log('\nCorona Station / SOUTH');

  departuresForStop.forEach((entry) => {
    const { stop_headsign, departure_time } = entry;
    console.log(
      `${stop_headsign?.padEnd(20)} - ${departure_time?.padStart(10)}`,
    );
  });

  // await openRunClose(getDeparturesForStop);
};

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
