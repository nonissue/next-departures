import { Database } from 'better-sqlite3';
import { getStops, getStoptimes, Stop } from 'gtfs';
import { ClockTime, GeoCoordinate, StopDepartures } from '@/types/global';
import { STATION_SEARCH_BOUNDING_BOX_AREA } from '@/config';
import { getServiceDate, getGtfsServiceTime } from '@/lib/time-utils';
import {
    SERVICE_DAY_START_HOUR,
    STATION_SEARCH_BOUNDING_BOX_AREA,
} from '@/config';
import { DEFAULT_LOOK_AHEAD_IN_MINS, DEFAULT_STOP_COUNT_LIMIT } from '@/config';

/**
 * 25-07-27 -> IS THIS EVEN USED?
 *
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
 * @param targetTime - string (optional) - timestamp to run query at specific time rather than defaulting to current time
 * @param tripLookaheadIntervalMins - number - not implemented yet
 * @param stopCount - number (optional, has default CONSTANT) - limits the number of departures we return for the provided stop
 * @throws Error if stopId isn't provided
 * @returns Array of Stoptimes[] containn objects for each matching upcoming departures for specified stop at current time (or at targetTime, if provided)
 */
export const getDeparturesForStop = async (
    stopId: string,
    targetTime?: ClockTime,
    // It might be super dangerous to mix optional and default params like this
    // I think it was causing a bug for me, where :stopId was being passed as a number
    // not a string, and so it was fucking with the tripLookaheadIntervalMins...
    tripLookaheadIntervalMins: number = DEFAULT_LOOK_AHEAD_IN_MINS,
    stopCount: number = DEFAULT_STOP_COUNT_LIMIT
): Promise<StopDepartures[]> => {
    if (!stopId) throw new Error('stopId is required');

    const [currentServiceDate, currentServiceTime] = targetTime
        ? [
              getServiceDate({ targetTime }),
              getGtfsServiceTime({ clockTime: targetTime }),
          ]
        : [getServiceDate(), getGtfsServiceTime()];

    console.log(
        'Params:\nstopId: ' +
            stopId +
            '\t\ttargetTime: ' +
            targetTime +
            '\t\ttripLookaheadIntervalMins: ' +
            tripLookaheadIntervalMins +
            '\t\tstopCount: ' +
            stopCount +
            '\n'
    );

    const DEBUG_MODE = false;
    if (DEBUG_MODE) {
        console.log(
            'currentServiceTime from getDeparturesForStop: ' +
                currentServiceTime
        );
        console.log(
            'currentServiceTime with offset from getDeparturesForStop: ' +
                getGtfsServiceTime({ offsetMins: tripLookaheadIntervalMins })
        );
    }

    const departures = getStoptimes(
        {
            stop_id: stopId,
            date: currentServiceDate,
            start_time: currentServiceTime,
            // start_time: '23:45:00',
            // ..(endTime ? { end_time: endTime } : {})  // include end_time if defined
            end_time: getGtfsServiceTime({
                offsetMins: tripLookaheadIntervalMins,
            }),
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

    console.log('Departures returned: ' + departures.length);

    return departures.slice(0, stopCount);
};
