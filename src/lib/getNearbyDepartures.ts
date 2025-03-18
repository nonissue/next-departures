import { closeDb } from 'gtfs';
import { loadDb } from '../db.js';
import { Config } from '../types/global.js';
import { TEST_COORDS } from './constants.js';
import { getClosestStation, getStopsForParentStation } from './stop-utils.js';
import { getConfig, printDepartures } from './utils.js';
import { getDeparturesForStop } from '../getDeparturesForStop.js';

export const getNearbyDepartures = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  console.log('WARNING: GPS OORDS HARDCODED FOR DEV');
  const closestStation = await getClosestStation(TEST_COORDS);
  console.log(`Closest station is: ${closestStation.stop_name}`);

  const [platformA, platformB] = await getStopsForParentStation(
    closestStation.stop_id,
  );

  const departuresA = (await getDeparturesForStop(platformA.stop_id)).slice(
    0,
    5,
  );
  const departuresB = (await getDeparturesForStop(platformB.stop_id)).slice(
    0,
    5,
  );

  closeDb(db);

  const result = [[...departuresA], [...departuresB]];

  return result;
};

const test = await getNearbyDepartures();
printDepartures(test);
