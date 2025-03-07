import {
  closeDb,
  getAgencies,
  getStops,
  getStoptimes,
  openDb,
  advancedQuery,
} from 'gtfs';
import { getConfig } from './utils.js';
import { loadDb } from './db.js';
import { Config } from './types/global.js';
import {
  convertServiceTimeToClockTime,
  getCurrentServiceDate,
  getCurrentServiceTime,
  getStartAndStopTimeFormatted,
} from './lib/time-utils.js';
import { getDeparturesForStop } from './getDeparturesForStop.js';
import { getStopName } from './getStopName.js';

const previewConfig = async () => {
  const config = await getConfig();

  console.log(config);
};

const testOpeningDb = async () => {
  const config = await getConfig();
  let db;
  try {
    db = openDb(config);
  } catch (error) {
    console.error(
      `Unable to open sqlite database "${config.sqlitePath}" defined as \`sqlitePath\` config.json. Ensure the parent directory exists and import GTFS before running this app.`,
    );
  }

  console.log(db);
};

export const openRunClose = async (funcToRun: Function) => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  funcToRun();

  closeDb(db);
};

const testFunc = async () => {
  const tripLookaheadIntervalMins = 60;
  const currentServiceTime = getCurrentServiceTime();
  const currentServiceDate = getCurrentServiceDate();

  const formattedTimes = getStartAndStopTimeFormatted(
    tripLookaheadIntervalMins,
  );

  console.log(currentServiceDate);
  console.log(currentServiceTime);

  let coronaSouth;

  coronaSouth = getStoptimes(
    {
      stop_id: 1891, // Corona Southbound
      date: currentServiceDate,
      start_time: currentServiceTime,
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );

  console.log('\nCorona Station / SOUTH');

  coronaSouth.forEach((entry) => {
    const { stop_headsign, departure_time } = entry;
    console.log(
      `${stop_headsign?.padEnd(20)} - ${convertServiceTimeToClockTime(departure_time as string)?.padStart(10)}`,
    );
  });

  const southgateNorth = getStoptimes(
    {
      stop_id: '2114', // Southgate Northbound
      date: currentServiceDate,
      start_time: formattedTimes.start,
      end_time: formattedTimes.end,
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );

  console.log('\nSouthgate STN / NORTH');

  southgateNorth.forEach((entry) => {
    const { stop_headsign, departure_time } = entry;
    console.log(
      `${stop_headsign?.padEnd(20)} - ${departure_time?.padStart(10)}`,
    );
  });
};

const advancedQueryTest = async () => {
  // Example `advancedQuery` joining stop_times with trips.
  const advancedQueryOptions = {
    query: {
      'stop_times.trip_id': '28359464',
    },
    fields: ['stop_times.stop_headsign', 'stop_times.trip_id', 'arrival_time'],
    join: [
      {
        type: 'INNER',
        table: 'trips',
        on: 'stop_times.trip_id=trips.trip_id',
      },
    ],
  };

  const stopTimes = advancedQuery('stop_times', advancedQueryOptions);

  console.log(stopTimes);
  // stopTimes.forEach((entry) => {
  //   const { stop_headsign, departure_time } = entry;
  //   console.log(
  //     `${stop_headsign?.padEnd(20)} - ${departure_time?.padStart(10)}`,
  //   );
  // });
};

/* returns
  {
    stop_headsign: 'Clareview',
    stop_name: 'Southgate Station',
    arrival_time: '17:57:00'
  },
  */
const advancedQueryStoptimesStops = async () => {
  const advancedQueryOptions = {
    query: {
      'stop_times.stop_id': '2114',
    },
    fields: ['stop_times.stop_headsign', 'stops.stop_name', 'arrival_time'],
    join: [
      { type: 'INNER', table: 'stops', on: 'stop_times.stop_id=stops.stop_id' },
    ],
  };
  const stopTimes = advancedQuery('stop_times', advancedQueryOptions);
  console.log(stopTimes);
};

const runner = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);
  // await getDeparturesForStop('1926');
  // await getStopName('1926');
  await advancedQueryStoptimesStops();
  closeDb(db);
  // await openRunClose(testFunc);
};
runner();
