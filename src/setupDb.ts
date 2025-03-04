import { importGtfs, openDb } from 'gtfs';
import fetchConfig from './fetchConfig.js';

const initDb = async () => {
  const config = await fetchConfig();
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

export default initDb;
