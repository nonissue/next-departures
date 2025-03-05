import { format } from 'path';
import { padLeadingZeros } from '../utils.js';

export const getCurrentDate = () => {
  const currentDate = new Date();
  const formattedDate =
    currentDate.getFullYear() * 10000 +
    (currentDate.getMonth() + 1) * 100 +
    currentDate.getDate();
  return formattedDate;
};

export const getYesterdaysDate = () => {
  const currentDate = new Date();
  const formattedDate =
    currentDate.getFullYear() * 10000 +
    (currentDate.getMonth() + 1) * 100 +
    currentDate.getDate() -
    1;
  return formattedDate;
};

export const getCurrentTime = () => {
  const currentTime = new Date();
  const currentTimeFormatted = currentTime.toLocaleTimeString('eo', {
    hour12: false,
  });

  return currentTimeFormatted;
};

/**
 * Validates the configuration object for GTFS import
 * @param interval the interval between startTime and endTime (minutes, default = 60)
 * @throws Error if agencies are missing or if agency lacks both url and path
 * @returns an object containing formatted start and stop times
 */
export const getStartAndStopTimeFormatted = (interval: number = 60) => {
  const targetTime = '23:30:00'; // this could be startTime.toLocaleString etc to get current
  // const targetTime = new Date().toLocaleTimeString('eo', { hour12: false });
  const [hours, minutes, seconds] = targetTime.split(':').map(Number);
  const SERVICE_DAY_END_HOUR = 5;
  const normalizedStart = `${hours < SERVICE_DAY_END_HOUR ? hours + 24 : hours}:${minutes}:${seconds}`;
  const normalizedEnd = `${(hours < SERVICE_DAY_END_HOUR ? hours + 24 : hours) + 1}:${minutes}:${seconds}`;
  // const tmp2 = `${hours < SERVICE_DAY_END_HOUR ? hours + 24 : hours}:${minutes}:${seconds}`;

  // const startTime = new Date('23:00:00');
  const startTime = new Date();
  /*
  GTFS spec says:
  
  if startTime hours is less than, say, 4, add 24 to it
  eg. 00:30:00 becomes 24:30:00 
  

*/

  const tmp = `${startTime.getHours() + 1}:${startTime.getMinutes()}:${startTime.getSeconds()}`;
  // console.log(padLeadingZeros(tmp2));

  const formattedTimes = {
    // this needs to be modified ->
    // if our startTime + interval occurs after midnight
    //    eg. startTime: 23:45:00 | +60m | endTime: 00:45:00
    // But occurs on the same *service day*, the endTime
    //    eg. startTime: 23:45:00 | +60m | endTime: 24:45:00
    // end: new Date(
    //   startTime.getTime() + interval * 60 * 1000,
    // enter the end time as a value greater than 24:00:00
    // ).toLocaleTimeString('eo', { hour12: false }),
    // start: startTime.toLocaleTimeString('eo', {
    //   hour12: false,
    // }),
    // end: padLeadingZeros(tmp),
    // start: targetTime,
    // end: padLeadingZeros(tmp2),
    start: normalizedStart,
    end: normalizedEnd,
  };

  return formattedTimes;
};
