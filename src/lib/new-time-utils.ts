import { SERVICE_DAY_END_HOUR } from '../config.js';
interface ServiceDateOptions {
  calendarDate?: string;
  targetTime?: string;
}

export const getServiceDate = ({
  calendarDate,
  targetTime,
}: ServiceDateOptions = {}): number => {
  const now = new Date();
  const timeStr = targetTime ?? now.toTimeString().slice(0, 8);
  const [hours] = timeStr.split(':').map(Number);
  const baseDate = calendarDate
    ? new Date(
        Number(calendarDate.slice(0, 4)),
        Number(calendarDate.slice(4, 6)) - 1,
        Number(calendarDate.slice(6, 8)),
      )
    : now;

  const adjustedDate =
    hours < SERVICE_DAY_END_HOUR
      ? new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate() - 1,
        )
      : new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
        );

  return (
    adjustedDate.getFullYear() * 10000 +
    (adjustedDate.getMonth() + 1) * 100 +
    adjustedDate.getDate()
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
