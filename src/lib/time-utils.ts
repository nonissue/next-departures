import { padLeadingZeros } from '../utils.js';

const SERVICE_DAY_END_HOUR = 5;
const LAST_CLOCK_HOUR = 23;
const HOURS_IN_A_DAY = 24;

export const getCurrentDate = () => {
  // const currentDate = new Date()
  const currentDate = new Date().toLocaleDateString('eo', {});

  // const formattedDate =
  //   currentDate.getFullYear() * 10000 +
  //   (currentDate.getMonth() + 1) * 100 +
  //   currentDate.getDate();
  return currentDate;
};

export const getCurrentServiceDate = () => {
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString('eo', {
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

/**
 * Gets the current time for the GTFS service day
 * @param none
 * @throws none
 * @returns string currentServiceTime
 * Converts the current clock time to the current service day time
 * Returns the result with leading zero padding if required
 */
export const getCurrentServiceTime = () => {
  const currentTime = new Date().toLocaleTimeString('eo', {
    hour12: false,
  });

  const [hours, minutes, seconds] = currentTime.split(':').map(Number);

  const currentServiceTime = `${hours < SERVICE_DAY_END_HOUR ? hours + HOURS_IN_A_DAY : hours}:${minutes}:${seconds}`;
  // console.log('SERVICE TIME IS MOCKED');
  // const mockedCurrentServiceTime = `${hours < 5 ? hours + 12 : 1}:${minutes}:${seconds}`;

  return padLeadingZeros(currentServiceTime);
};

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
  // TODO: Can be removed since we're using typescript?
  // if ([hours, minutes, seconds].some(isNaN) || minutes >= 60 || seconds >= 60) {
  //   return null;
  // }

  return hours * 3600 + minutes * 60 + seconds;
}
