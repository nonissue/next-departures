import { closeDb, getStops } from 'gtfs';
import fetchConfig from './fetchConfig.js';
import initDb from './setupDb.js';

const main = async () => {
  //   console.log(await fetchConfig());
  const db = await initDb();

  console.log(db);
  const stops = getStops({
    stop_id: ['2113', '2114'],
  });

  console.log(stops);
  closeDb(db);
};

main();
