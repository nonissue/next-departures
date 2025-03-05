import { closeDb, getAgencies, getStops, getStoptimes, openDb } from 'gtfs';
import { getConfig } from './utils.js';
import test from 'node:test';
import { importGtfsDataToDb, loadDb } from './db.js';
import { Config } from './types/global.js';
import { getCurrentDate, getCurrentTime } from './lib/time-utils.js';

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
    console.log('openRunClose');

    const config: Config = await getConfig();

    const db = await loadDb(config);
    console.log('Db loaded');

    funcToRun();

    closeDb(db);
  };

  const testFunc = () => {
    const stopTimesNorth = getStoptimes(
      {
        stop_id: '1891', // Corona Southbound
        date: getCurrentDate(),
        start_time: '21:42:00',
        end_time: '22:42:00',
      },
      ['trip_id', 'stop_headsign', 'departure_time'],
      [['departure_time', 'ASC']],
    );

    const stoptimesSouth = getStoptimes(
      {
        stop_id: '2114', // Southgate Northbound
        date: getCurrentDate(),
        start_time: '21:42:00',
        end_time: '22:42:00',
      },
      ['trip_id', 'stop_headsign', 'departure_time'],
      [['departure_time', 'ASC']],
    );

    console.log(stoptimesSouth);
  };

  //   await runLoadDb();
  //   await openRunClose(testFunc);
  console.log(getCurrentTime());
};

runner();
