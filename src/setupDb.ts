import { importGtfs, openDb } from 'gtfs';
import { getConfig } from './getConfig.js';

const initDb = async () => {
  const config = await getConfig();
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
