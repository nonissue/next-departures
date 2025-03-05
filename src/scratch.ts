import { openDb } from 'gtfs';
import { getConfig } from './utils.js';
import test from 'node:test';
import { importGtfsDataToDb } from './db.js';
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
  //   await testOpeningDb();
  const config: Config = await getConfig();
  await importGtfsDataToDb(config);
};

runner();
