import { SERVICE_DAY_END_HOUR } from '../config.js';

export const getServiceDate = (
  calendarDate?: string,
  targetTime?: string,
): number => {
  if (calendarDate && !targetTime) {
    throw new Error(
      "If 'calendarDate' is provided, 'targetTime' must also be provided.",
    );
  }

  // Use provided date or default to today
  const now = new Date();
  const serviceBaseDate = calendarDate
    ? new Date(
        Number(calendarDate.slice(0, 4)), // Year
        Number(calendarDate.slice(4, 6)) - 1, // Month (0-based)
        Number(calendarDate.slice(6, 8)), // Day
      )
    : now;

  // Use provided time or default to current time
  const timeString = targetTime ?? now.toTimeString().slice(0, 8);
  const [hours] = timeString.split(':').map(Number);

  // Adjust service date based on GTFS service day rules
  if (hours < SERVICE_DAY_END_HOUR) {
    serviceBaseDate.setDate(serviceBaseDate.getDate() - 1);
  }

  // Return in YYYYMMDD format
  return (
    serviceBaseDate.getFullYear() * 10000 +
    (serviceBaseDate.getMonth() + 1) * 100 +
    serviceBaseDate.getDate()
  );
};

export const getServiceTime = (clockTime?: string): string => {
  const now = new Date();

  // Use provided time or default to current time (HH:mm:ss)
  const timeString = clockTime ?? now.toTimeString().slice(0, 8);
  const [hours, minutes, seconds] = timeString.split(':').map(Number);

  // Convert to GTFS service time
  const serviceHours = hours < SERVICE_DAY_END_HOUR ? hours + 24 : hours;

  return `${serviceHours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
