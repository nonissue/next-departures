import { closeDb, getAgencies, getStops, openDb } from 'gtfs';
import { getConfig } from './utils.js';
import test from 'node:test';
import { importGtfsDataToDb, loadDb } from './db.js';
import { Config } from './types/global.js';

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
    const stops = getStops({
      stop_id: ['1891', '2114'],
    });

    console.log(stops);
  };

  //   await runLoadDb();
  await openRunClose(testFunc);
};

runner();
