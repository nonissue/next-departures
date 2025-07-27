import { SERVICE_DAY_END_HOUR } from '@/config';
import { HOURS_IN_A_DAY, LAST_CLOCK_HOUR } from '@/lib/constants';

interface ServiceDateOptions {
    calendarDate?: string;
    targetTime?: string;
}

export const getCurrentDate = () => {
    const currentDate = new Date();

    const formattedDate =
        currentDate.getFullYear() * 10000 +
        (currentDate.getMonth() + 1) * 100 +
        currentDate.getDate();
    return formattedDate;
};

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
              Number(calendarDate.slice(6, 8))
          )
        : now;

    const adjustedDate =
        hours < SERVICE_DAY_END_HOUR
            ? new Date(
                  baseDate.getFullYear(),
                  baseDate.getMonth(),
                  baseDate.getDate() - 1
              )
            : new Date(
                  baseDate.getFullYear(),
                  baseDate.getMonth(),
                  baseDate.getDate()
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
 * Ensures time components have leading zeros (e.g., "9:5:1" -> "09:05:01")
 * @param time Time string in HH:mm:ss format
 * @returns Formatted time string with leading zeros, or null if invalid format
 */
export function padLeadingZeros(time: string) {
    const split = time
        .split(':')
        .map((d) => String(Number(d)).padStart(2, '0'));
    if (split.length !== 3) {
        throw new Error(
            "padLeadingZeros: input must be a string in the form 'HH:MM:SS'"
        );
    }

    return split.join(':');
}
