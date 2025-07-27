import { SERVICE_DAY_END_HOUR } from '@/config';
import { HOURS_IN_A_DAY, LAST_CLOCK_HOUR } from '@/lib/constants';
import { ClockTime, ServiceTime } from '@/types/global';

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
              Number(calendarDate.slice(0, 4)), // year
              Number(calendarDate.slice(4, 6)) - 1, // monthIndex (starts at 0)
              Number(calendarDate.slice(6, 8)) // day
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

/**
 * getGtfsServiceTime
 * @param clockTime - ClockTime (optional) - a string in format "HH:MM:SS" that represents the 24 clock time to convert into service time
 * @param offSetInMinutes - number, optional - a number representing how many minutes should be added to returned service time
 * @throws Error if stopId isn't provided
 * @returns string - a string in the format "HH:MM:SS" representing a time in the current service day (eg. more than 24 hours)
 */
export const getGtfsServiceTime = (
    clockTime?: ClockTime,
    offsetInMinutes?: number
): ServiceTime => {
    // 1. Build a Date that represents the *base* time today
    const base = (() => {
        if (clockTime) {
            const [hh, mm, ss] = clockTime.split(':').map(Number);
            const d = new Date(); // today
            d.setHours(hh, mm, ss, 0);
            return d;
        }
        return new Date(); // now
    })();

    // 2. Apply the offset, if any
    if (offsetInMinutes && offsetInMinutes !== 0) {
        base.setMinutes(base.getMinutes() + offsetInMinutes);
    }

    // 3. Convert to service‑day HH:mm:ss
    const hours = base.getHours();
    const minutes = base.getMinutes();
    const seconds = base.getSeconds();

    const serviceHours = hours < SERVICE_DAY_END_HOUR ? hours + 24 : hours;

    const hh = String(serviceHours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${hh}:${mm}:${ss}` as ServiceTime;
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
    return padTimeStamp(clockTime);
};

/**
 * Ensures time components have leading zeros (e.g., "9:5:1" -> "09:05:01")
 * @param time Time string in HH:mm:ss format
 * @returns Formatted time string with leading zeros, or null if invalid format
 */
export function padTimeStamp(time: string) {
    const split = time
        .split(':')
        .map((d) => String(Number(d)).padStart(2, '0'));
    if (split.length !== 3) {
        throw new Error(
            "padTimeStamp: input must be a string in the form 'HH:MM:SS'"
        );
    }

    return split.join(':');
}
