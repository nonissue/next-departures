import { closeDb } from 'gtfs';
import { getConfig } from '../lib/utils.js';
import { importGtfsDataToDb, loadDb } from '../lib/db-utils.js';
import { Config } from '../types/global.js';
import { getDeparturesForStop } from '../lib/get-departures-for-stop.js';

const runGetDeparturesForStop = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  const res = await getDeparturesForStop('1926', '23:15:00');

  // const res = await getDeparturesForStop('1926');
  // console.log(res);

  closeDb(db);
};

const runDownloadAndImportGtfsDataToDb = async () => {
  const config: Config = await getConfig();
  await importGtfsDataToDb(config);
};

const play = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  closeDb(db);
};

// await play();
// console.log(`getServiceDate: ${play()}`);
runGetDeparturesForStop();
// await runDownloadAndImportGtfsDataToDb();
