import { closeDb, getStoptimes, advancedQuery } from 'gtfs';
import { getConfig } from './utils.js';
import { loadDb } from './db.js';
import { Config } from './types/global.js';
import { getDeparturesForStop } from './getDeparturesForStop.js';

const runner = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  const res = await getDeparturesForStop('1926');
  console.log(res);

  closeDb(db);
};

runner();
