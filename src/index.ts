import { closeDb, getStoptimes } from 'gtfs';
import initDb from './setupDb.js';
import getCurrentDate from './getCurrentDate.js';

const main = async () => {
  const db = await initDb();

  const stoptimesSouth = await getStoptimes(
    {
      stop_id: '1891', // Corona Southbound
      date: getCurrentDate(),
      start_time: '21:42:00',
      end_time: '22:42:00',
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );
  console.log(stoptimesSouth);

  const stoptimesNorth = await getStoptimes(
    {
      stop_id: '2114', // Southgate Northbound
      date: getCurrentDate(),
      start_time: '21:42:00',
      end_time: '22:42:00',
    },
    ['trip_id', 'stop_headsign', 'departure_time'],
    [['departure_time', 'ASC']],
  );

  console.log(stoptimesNorth);

  closeDb(db);
};

main();
