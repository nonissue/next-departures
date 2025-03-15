import { padLeadingZeros } from './utils.js';
import { HOURS_IN_A_DAY, LAST_CLOCK_HOUR } from './constants.js';
import { SERVICE_DAY_END_HOUR } from '../config.js';

export const getCurrentDate = () => {
  const currentDate = new Date();

  const formattedDate =
    currentDate.getFullYear() * 10000 +
    (currentDate.getMonth() + 1) * 100 +
    currentDate.getDate();
  return formattedDate;
};

export const getCurrentTimeAsString = () => {
  return new Date().toLocaleTimeString('eo', {
    hour12: false,
  });
};

/**
 * Gets the current time in the context of the current GTFS service day
 * @param timestamp string (optional) if provided, func converts provided clock time to service time
 * @throws none
 * @returns string serviceTime
 * Returns either current time in service time or provided string timestamp converted into service time
 * Returns the result with leading zero padding if required
 */
export const getServiceTime = (timestamp?: string) => {
  const targetTime =
    timestamp ||
    new Date().toLocaleTimeString('eo', {
      hour12: false,
    });

  const [hours, minutes, seconds] = targetTime.split(':').map(Number);

  const serviceTime = `${hours < SERVICE_DAY_END_HOUR ? hours + HOURS_IN_A_DAY : hours}:${minutes}:${seconds}`;
  // console.log('SERVICE TIME IS MOCKED');
  // const mockedCurrentServiceTime = `${hours < 5 ? hours + 12 : 1}:${minutes}:${seconds}`;

  return padLeadingZeros(serviceTime);
};

/**
 * getServiceDate
 * Gets the current date in the context of the current GTFS service date
 * @param timestamp
 * @throws none
 * @returns string
 *
 * Notes
 *
 * Service time extends past 24 hours which means service date and calendar date can diverge
 * This function takes that into consideration, and using the constant SERVICE_DAY_END_HOUR,
 * returns the current service day which is sometimes yesterday.
 *
 */
export const getServiceDate = (timestamp?: string) => {
  const currentDate = new Date();
  const currentTime =
    timestamp ??
    currentDate.toLocaleTimeString('eo', {
      hour12: false,
    });

  const [hours, minutes, seconds] = currentTime.split(':').map(Number);

  if (hours < SERVICE_DAY_END_HOUR) {
    return (
      currentDate.getFullYear() * 10000 +
      (currentDate.getMonth() + 1) * 100 +
      currentDate.getDate() -
      1
    );
  } else {
    return (
      currentDate.getFullYear() * 10000 +
      (currentDate.getMonth() + 1) * 100 +
      currentDate.getDate()
    );
  }
};

export const getServiceTimeAndDate = (
  targetDate?: string,
  targetTime?: string,
) => {
  let cDate, cTime;
  if (!targetDate) {
    cDate = getServiceDate();
  } else {
    cDate = getServiceDate(targetDate);
  }
};

/**
 * Todo
 * @param serviceTime string
 * @returns string
 * taken from `node-gtfs`
 */
export const convertServiceTimeToClockTime = (serviceTime: string) => {
  const [hours, minutes, seconds] = serviceTime.split(':').map(Number);
  const clockTime = `${hours > LAST_CLOCK_HOUR ? hours - HOURS_IN_A_DAY : hours}:${minutes}:${seconds}`;
  return padLeadingZeros(clockTime);
};

/**
 * Converts time string in HH:mm:ss format to seconds since midnight
 * @param time Time string in HH:mm:ss format
 * @returns Number of seconds since midnight, or null if invalid format
 * taken from `node-gtfs`
 */
export function calculateSecondsFromMidnight(time: string): number | null {
  // TODO: Can be removed since we're using typescript?
  // if (!time || typeof time !== 'string') {
  //   return null;
  // }

  const [hours, minutes, seconds] = time.split(':').map(Number);

  if ([hours, minutes, seconds].some(isNaN) || minutes >= 60 || seconds >= 60) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}
