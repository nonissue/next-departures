import { Database } from 'better-sqlite3';
import { getStops, getStoptimes, Stop } from 'gtfs';

import {
    getServiceDate,
    getGtfsServiceTime,
    convertServiceTimeToClockTime,
} from '@/lib/time-utils';
import { ClockTime, GeoCoordinate } from '@/types/global';
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
// export const getDeparturesForStop = async (
//     stopId: string,
//     targetTime?: ClockTime,
//     // It might be super dangerous to mix optional and default params like this
//     // I think it was causing a bug for me, where :stopId was being passed as a number
//     // not a string, and so it was fucking with the tripLookaheadIntervalMins...
//     tripLookaheadIntervalMins: number = DEFAULT_LOOK_AHEAD_IN_MINS,
//     stopCount: number = DEFAULT_STOP_COUNT_LIMIT
// ): Promise<StopDepartures[]> => {
//     if (!stopId) throw new Error('stopId is required');

//     const [currentServiceDate, currentServiceTime] = targetTime
//         ? [
//               getServiceDate({ targetTime }),
//               getGtfsServiceTime({ clockTime: targetTime }),
//           ]
//         : [getServiceDate(), getGtfsServiceTime()];

//     console.log(
//         'Params:\nstopId: ' +
//             stopId +
//             '\t\ttargetTime: ' +
//             targetTime +
//             '\t\ttripLookaheadIntervalMins: ' +
//             tripLookaheadIntervalMins +
//             '\t\tstopCount: ' +
//             stopCount +
//             '\n'
//     );

//     const DEBUG_MODE = false;
//     if (DEBUG_MODE) {
//         console.log(
//             'currentServiceTime from getDeparturesForStop: ' +
//                 currentServiceTime
//         );
//         console.log(
//             'currentServiceTime with offset from getDeparturesForStop: ' +
//                 getGtfsServiceTime({ offsetMins: tripLookaheadIntervalMins })
//         );
//     }

//     const departures = getStoptimes(
//         {
//             stop_id: stopId,
//             date: currentServiceDate,
//             start_time: currentServiceTime,
//             // start_time: '23:45:00',
//             // ..(endTime ? { end_time: endTime } : {})  // include end_time if defined
//             end_time: getGtfsServiceTime({
//                 offsetMins: tripLookaheadIntervalMins,
//             }),
//         },
//         [
//             'stop_id',
//             'trip_id',
//             'stop_headsign',
//             'departure_time',
//             'departure_timestamp',
//         ],
//         [['departure_time', 'ASC']]
//     ) as StopDepartures[];

//     console.log('Departures returned: ' + departures.length);

//     return departures.slice(0, stopCount);
// };

export type StopDepartures = {
    stop_id: string;
    trip_id: string;
    stop_headsign: string | null;
    departure_time: string; // GTFS service time, may be >= 24:00:00
    departure_timestamp?: number; // present in some imports
};

export type GetDeparturesForStopOptions = {
    stopId: string | number;
    clockTime?: ClockTime; // "HH:mm:ss" (0–23h)
    baseTime?: Date; // default: now
    calendarDate?: string | number | Date;
    lookaheadMins?: number; // default: DEFAULT_LOOK_AHEAD_IN_MINS
    limit?: number; // default: DEFAULT_STOP_COUNT_LIMIT
    tz?: string; // default: 'America/Edmonton'
    serviceDayStartHour?: number; // default: 3
    debug?: boolean;
};

/**
 * Returns upcoming departures for a stop within a time window.
 * Uses GTFS "service date" and "service time" (times may exceed 24:00:00).
 */
export async function getDeparturesForStop({
    stopId,
    clockTime,
    baseTime = new Date(),
    calendarDate,
    lookaheadMins = DEFAULT_LOOK_AHEAD_IN_MINS,
    limit = DEFAULT_STOP_COUNT_LIMIT,
    tz = 'America/Edmonton',
    serviceDayStartHour = SERVICE_DAY_START_HOUR,
    debug = false,
}: GetDeparturesForStopOptions): Promise<StopDepartures[]> {
    const id = String(stopId).trim();

    if (!id) throw new Error('getDeparturesForStop: stopId is required');

    // --- Build service window from a single source of truth ---
    const startServiceTime = clockTime
        ? getGtfsServiceTime({ clockTime, tz, serviceDayStartHour })
        : getGtfsServiceTime({ baseTime, tz, serviceDayStartHour });

    const endServiceTime = clockTime
        ? getGtfsServiceTime({
              clockTime,
              tz,
              serviceDayStartHour,
              offsetMins: lookaheadMins,
          })
        : getGtfsServiceTime({
              baseTime,
              tz,
              serviceDayStartHour,
              offsetMins: lookaheadMins,
          });

    // Service date decision uses *clock* time (0–23h)
    const startClockTime = convertServiceTimeToClockTime(startServiceTime);
    const serviceDate = getServiceDate({
        calendarDate: calendarDate ?? (clockTime ? undefined : baseTime),
        targetTime: startClockTime,
        tz,
        serviceDayStartHour,
    });

    if (debug) {
        console.log(
            JSON.stringify(
                {
                    stopId: id,
                    serviceDate,
                    startServiceTime,
                    endServiceTime,
                    lookaheadMins,
                    limit,
                    tz,
                    serviceDayStartHour,
                },
                null,
                2
            )
        );
    }

    // ---- Query node-gtfs ----
    const rows = getStoptimes(
        {
            stop_id: id,
            date: serviceDate, // e.g., 20250801 (number or "YYYYMMDD")
            start_time: startServiceTime, // "HH:mm:ss", may be >= 24h
            end_time: endServiceTime, // "HH:mm:ss", may be >= 24h
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

    // Defensive: ensure sorted (some feeds return same-second ties)
    rows.sort((a, b) => {
        // Prefer numeric timestamp if present; fallback to string time
        if (a.departure_timestamp != null && b.departure_timestamp != null) {
            return a.departure_timestamp - b.departure_timestamp;
        }
        return a.departure_time.localeCompare(b.departure_time);
    });

    return rows.slice(0, Math.max(1, limit));
}
