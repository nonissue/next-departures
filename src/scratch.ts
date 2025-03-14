import { closeDb } from 'gtfs';
import { getConfig } from './utils.js';
import { importGtfsDataToDb, loadDb } from './db.js';
import { Config } from './types/global.js';
import { getDeparturesForStop } from './getDeparturesForStop.js';

const runGetDeparturesForStop = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  const res = await getDeparturesForStop('1926');
  console.log(res);

  closeDb(db);
};

const runDownloadAndImportGtfsDataToDb = async () => {
  const config: Config = await getConfig();
  await importGtfsDataToDb(config);
};

runGetDeparturesForStop();
// await runDownloadAndImportGtfsDataToDb();
