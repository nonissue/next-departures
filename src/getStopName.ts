import { closeDb, getStopAttributes, getStops } from 'gtfs';
import { loadDb } from './db.js';

export const getStopName = (stopId: string) => {
  let stopFields;

  stopFields = getStops(
    {
      stop_id: stopId, // Corona Southbound
    },
    // ['stop_id', 'stop_name'],
    [],
    [],
  );
  console.log(stopFields);

  // let test = await getStopAttributes({ stop_id: '2114' });
  // test = await getStopAttributes();
  // console.log(test);

  stopFields.forEach((entry) => {
    const { stop_id, stop_name } = entry;
    console.log(`${stop_id?.padEnd(10)} ${stop_name?.padEnd(30)}`);
  });

  // test.forEach((entry) => {
  //   const { stop_id, stop_name } = entry;
  //   console.log(`${stop_id?.padEnd(10)} ${stop_name?.padEnd(30)}`);
  // });
};
