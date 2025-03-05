import { closeDb, importGtfs, openDb } from 'gtfs';
import { validateConfigForImport } from './utils.js';
import { getConfig } from './utils.js';
import { Config } from './types/global.js';

export const loadDb = async (config: Config) => {
  // const config = await fetchConfig();
  // validateConfigForImport(config);

  if (!config.sqlitePath) {
    throw new Error(
      `To load and connect to an existing database, config.json must contain a valid \`sqlitePath\``,
    );
  }

  let db;

  try {
    db = openDb(config);
  } catch (error) {
    console.error(
      `Unable to open sqlite database "${config.sqlitePath}" defined as \`sqlitePath\` config.json. Ensure the parent directory exists and import GTFS before running this app.`,
    );
  }

  return db;
};

export const importGtfsDataToDb = async (config: Config) => {
  console.log('config from importGtfsToDb');
  console.log(config);
  return;

  console.time('GTFS Import Duration'); // Start the timer

  let db;

  try {
    db = await loadDb(config);
  } catch (error: any) {
    throw new Error(error);
  }

  console.log(
    `Starting GTFS import for ${config.agencies.length} agency(s) using SQLite database at ${config.sqlitePath}`,
  );

  try {
    await importGtfs({ agencies: config.agencies, db: db });
  } catch (error) {
    console.error(error);
  }

  console.timeEnd('GTFS Import Duration'); // End the timer and log duration
};

export const dbTest = async () => {
  const config = await getConfig();
  const agencyCount = config.agencies.length;

  validateConfigForImport(config);
};

const main = async () => {
  //   await populateDb();
  const config = await getConfig();
  let gtfsDb;
  try {
    gtfsDb = await loadDb(config);
  } catch (error: any) {
    throw new Error(error);
  }

  console.log(gtfsDb);

  closeDb(gtfsDb);
};

// main();

const scratch = async () => {
  const config = await getConfig();

  console.log(config);

  importGtfsDataToDb(config);
};

// scratch();
