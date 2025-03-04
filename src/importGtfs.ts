// Using `openDb` from node-gtfs to open database
import { importGtfs, openDb } from 'gtfs';
import fetchConfig from './fetchConfig.js';

const dbSetup;

importGtfs({
  agencies: [
    {
      path: '/path/to/the/unzipped/gtfs/',
    },
  ],
  db: db,
});
