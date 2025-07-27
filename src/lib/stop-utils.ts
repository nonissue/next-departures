import { Database } from 'better-sqlite3';
import { getStops, getStoptimes, Stop } from 'gtfs';
import { ClockTime, GeoCoordinate, StopDepartures } from '@/types/global';
import { STATION_SEARCH_BOUNDING_BOX_AREA } from '@/config';
import { getServiceDate, getGtfsServiceTime } from '@/lib/time-utils';

/**
 * Retrieves all transit stations from the GTFS stops table.
 * A transit station is defined as any stop that is referenced as a parent_station
 * by at least one other stop.
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getTransitStations = (db: Database): Stop[] => {
    const stations = `
    SELECT *
    FROM stops
    WHERE location_type = 1
    ORDER BY stops.stop_name;
  `;

    let queryToRun = stations;
    const queryResults = db.prepare(queryToRun).all();

    return queryResults as Stop[];
};

/**
 * Retrieves closest "station" from GTFS stops.
 * A "station" is a stop with `location_type=1`
 *
 * @returns Promise<Stop[]> - an array of stop objects representing transit stations.
 */
export const getClosestStation = ({ lat, lon }: GeoCoordinate = {}): Stop => {
    const nearbyStations = getStops(
        {
            location_type: 1,
            stop_lat: lat,
            stop_lon: lon,
        },
        [],
        [],
        {
            bounding_box_side_m: STATION_SEARCH_BOUNDING_BOX_AREA,
        }
    );

    return nearbyStations[0];
};

export const getStopsForParentStation = (parent_station_id: string): Stop[] => {
    const platforms = getStops({
        parent_station: parent_station_id,
        location_type: 0,
    });

    return [...platforms];
};

/**
 * getDeparturesForStop
 * @param stopId - string - `node-gtfs` docs type this as string
 * @param targetTime - string (optional) - timestamp to run query at specific time
 * @param tripLookaheadIntervalMins - number - not implemented yet
 * @throws Error if stopId isn't provided
 * @returns Array of Stoptimes[] containn objects for each matching upcoming departures for specified stop at current time (or at targetTime, if provided)
 */
export const getDeparturesForStop = async (
    stopId: string,
    targetTime?: ClockTime,
    tripLookaheadIntervalMins: number = 120,
    stopCount: number = 6
): Promise<StopDepartures[]> => {
    if (!stopId) throw new Error('stopId is required');

    const [currentServiceDate, currentServiceTime] = targetTime
        ? [getServiceDate({ targetTime }), getGtfsServiceTime(targetTime)]
        : [getServiceDate(), getGtfsServiceTime()];

    const departures = getStoptimes(
        {
            stop_id: stopId,
            date: currentServiceDate,
            start_time: currentServiceTime,
        },
        [
            'stop_id',
            'trip_id',
            'stop_headsign',
            'departure_time',
            'departure_timestamp',
        ],
        [['departure_time', 'ASC']]
    ) as StopDepartures[];

    return departures.slice(0, stopCount);
};
