import { Options } from 'csv-parse';
import { Database } from 'better-sqlite3';

// a lot of these taken from node-gtfs

export interface ConfigAgency {
  exclude?: string[];
  url?: string;
  path?: string;
  headers?: Record<string, string>;
  realtimeAlerts?: {
    url: string;
    headers?: Record<string, string>;
  };
  realtimeTripUpdates?: {
    url: string;
    headers?: Record<string, string>;
  };
  realtimeVehiclePositions?: {
    url: string;
    headers?: Record<string, string>;
  };
  prefix?: string;
}

export interface Agency {
  agency_id?: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
  agency_fare_url?: string;
  agency_email?: string;
}

export interface Config {
  db?: Database;
  sqlitePath?: string;
  gtfsRealtimeExpirationSeconds?: number;
  downloadTimeout?: number;
  csvOptions?: Options;
  exportPath?: string;
  ignoreDuplicates?: boolean;
  ignoreErrors?: boolean;
  agencies: ConfigAgency[];
  verbose?: boolean;
  logFunction?: (message: string) => void;
}

export interface StopDepartures {
  stop_id: string;
  trip_id: string;
  stop_headsign: string;
  departure_time: string;
  departure_timestamp: number;
}
