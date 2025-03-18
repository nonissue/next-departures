import { closeDb } from 'gtfs';
import { loadDb } from '../db.js';
import { Config } from '../types/global.js';
import { TEST_COORDS } from './constants.js';
import { getClosestStation, getStopsForParentStation } from './stop-utils.js';
import { getConfig } from './utils.js';
import { getDeparturesForStop } from '../getDeparturesForStop.js';

export const getNearbyDepartures = async () => {
  const config: Config = await getConfig();

  const db = await loadDb(config);

  console.log('WARNING: GPS OORDS HARDCODED FOR DEV');
  const closestStation = await getClosestStation(TEST_COORDS);
  console.log(`Closest station is: ${closestStation.stop_name}`);

  const closestStops = await getStopsForParentStation(closestStation.stop_id);

  const departuresA = getDeparturesForStop(closestStops[0].stop_id);
  const departuresB = getDeparturesForStop(closestStops[1].stop_id);

  closeDb(db);
};

await getNearbyDepartures();
