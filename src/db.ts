import { closeDb, importGtfs, openDb } from 'gtfs';
import fetchConfig from './fetchConfig.js';

const getDb = async () => {
  const config = await fetchConfig();

  // log(config)();

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

const populateDb = async () => {
  const config = await fetchConfig();
  const agencyCount = config.agencies.length;

  console.log(
    `Starting GTFS import for ${agencyCount} using SQLite database at ${config.sqlitePath}`,
  );

  let db;

  try {
    db = await getDb();
  } catch (error: any) {
    throw new Error(error);
  }

  console.log(
    `Starting GTFS import for ${agencyCount} using SQLite database at ${config.sqlitePath}`,
  );

  try {
    await importGtfs({ agencies: config.agencies, db: db });
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  //   await populateDb();
  const gtfsDb = await getDb();

  console.log(gtfsDb);

  closeDb(gtfsDb);
};

main();
