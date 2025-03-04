import { closeDb, getStops, getStoptimes } from 'gtfs';
import fetchConfig from './fetchConfig.js';
import initDb from './setupDb.js';

const main = async () => {
  const db = await initDb();

  const stoptimes = getStoptimes(
    {
      stop_id: '1891', // Corona Southbound
      date: 20250303,
      start_time: '21:42:00',
      end_time: '22:42:00',
    },
    [],
    [['departure_time', 'ASC']],
  );

  console.log(stoptimes);

  closeDb(db);
};

main();
