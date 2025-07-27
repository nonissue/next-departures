import { importGtfs, openDb } from 'gtfs';
import { validateConfigForImport } from '@/lib/file-utils';
import { Config } from '@/types/global';

export const loadDb = async (config: Config) => {
  // const config = await fetchConfig();
  validateConfigForImport(config);

  if (!config.sqlitePath) {
    throw new Error(
      `To load and connect to an existing database, config.json must contain a valid \`sqlitePath\``,
    );
  }

  if (!config.agencies.length) {
    throw new Error('No agency defined in `config.json`');
  }

  let db;

  try {
    db = openDb(config);
  } catch (error) {
    console.error(
      `Unable to open sqlite database "${config.sqlitePath}" defined as \`sqlitePath\` config.json. Ensure the parent directory exists and import GTFS before running this app.`,
    );
    throw new Error('Error opening database');
  }

  return db;
};

export const importGtfsDataToDb = async (config: Config) => {
  console.log('config from importGtfsToDb');
  console.log(config);

  console.time('GTFS Import Duration'); // Start the timer

  let db;

  try {
    db = await loadDb(config);
  } catch (error: any) {
    throw new Error(error);
  }

  // console.log(
  //   `Starting GTFS import for ${config.agencies.length} agency(s) using SQLite database at ${config.sqlitePath}`,
  // );

  try {
    await importGtfs({ agencies: config.agencies, db: db });
  } catch (error) {
    console.error(error);
  }

  console.timeEnd('GTFS Import Duration'); // End the timer and log duration
};
