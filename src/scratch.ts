import { closeDb, getAgencies, getStops, getStoptimes, openDb } from 'gtfs';
import { getConfig } from './utils.js';
import test from 'node:test';
import { importGtfsDataToDb, loadDb } from './db.js';
import { Config } from './types/global.js';
import {
  getCurrentDate,
  getStartAndStopTimeFormatted,
  getYesterdaysDate,
} from './lib/time-utils.js';

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

const runner = async () => {
  const runImport = async () => {
    const config: Config = await getConfig();
    await importGtfsDataToDb(config);
  };

  const runLoadDb = async () => {
    console.log('LoadingDB!');
    const config: Config = await getConfig();

    const db = await loadDb(config);

    console.log(db);
    console.log(getAgencies());
    console.log(`Agency Count: ${getAgencies().length}`);

    closeDb(db);
  };

  const openRunClose = async (funcToRun: Function) => {
    const config: Config = await getConfig();

    const db = await loadDb(config);

    funcToRun();

    closeDb(db);
  };

  const testFunc = () => {
    const tripLookaheadIntervalMins = 60;
    const currentDate = getCurrentDate();
    const yesterdaysDate = getYesterdaysDate();
    const formattedTimes = getStartAndStopTimeFormatted(
      tripLookaheadIntervalMins,
    );

    console.log(formattedTimes);
    let coronaSouth;

    coronaSouth = getStoptimes(
      {
        stop_id: '1891', // Corona Southbound
        date: currentDate,
        start_time: formattedTimes.start,
        end_time: formattedTimes.end,
        // end_time: '25:59:59',
      },
      ['trip_id', 'stop_headsign', 'departure_time'],
      [['departure_time', 'ASC']],
    );
    console.log(coronaSouth.length);

    if (coronaSouth.length == 0) {
      console.log('TRYING AGAIN');
      coronaSouth = getStoptimes(
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

    coronaSouth.forEach((entry) => {
      const { stop_headsign, departure_time } = entry;
      console.log(
        `${stop_headsign?.padEnd(20)} - ${departure_time?.padStart(10)}`,
      );
    });

    // console.log(coronaSouth);

    const southgateNorth = getStoptimes(
      {
        stop_id: '2114', // Southgate Northbound
        date: currentDate,
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

  //   await runLoadDb();
  await openRunClose(testFunc);
  // console.log(getCurrentTime());
};

runner();
