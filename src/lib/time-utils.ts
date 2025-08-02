import { SERVICE_DAY_START_HOUR } from '@/config';
import { ClockTime, ServiceTime } from '@/types/global';
import {
    clampHour,
    resolveYmd,
    resolveHour,
    addDays,
    parseClockTime,
    timePartsInTz,
    pad2,
    ymdToNumber,
} from './time-helpers';

type ServiceDateOptions = {
    /** Base calendar date; if omitted, uses "today" in tz. */
    calendarDate?: string | number | Date; // "20250801" | 20250801 | Date
    /** GTFS-style time; may exceed 24h (e.g., "25:10:00"). If omitted, uses now in tz. */
    targetTime?: string; // "HH:mm:ss"
    /** Local agency TZ (IANA). */
    tz?: string; // default: "America/Edmonton"
    /** Hour of cutover when a new service day starts (0–23). */
    serviceDayStartHour?: number; // default: SERVICE_DAY_START_HOUR config
};

/** Public API */
export function getServiceDate(opts: ServiceDateOptions = {}): number {
    const tz = opts.tz ?? 'America/Edmonton';
    const cut = clampHour(opts.serviceDayStartHour ?? SERVICE_DAY_START_HOUR);

    // 1) Resolve base Y/M/D in TZ
    const baseYmd = resolveYmd(opts.calendarDate, tz);

    // 2) Resolve hour from targetTime or "now" in TZ
    const hour = resolveHour(opts.targetTime, tz);

    // 3) Decide if we roll back a day:
    //    If hour < cutover AND hour < 24, we are still in the previous service day.
    //    (Times >= 24:00 are explicitly "same service day" in GTFS.)
    const ymd = hour < cut && hour < 24 ? addDays(baseYmd, -1) : baseYmd;

    return ymdToNumber(ymd);
}

type GetGtfsServiceTimeOptions = {
    /** Either specify the wall-clock time-of-day... */
    clockTime?: ClockTime; // "HH:mm:ss" (0–23 hours)
    /** ...or give a Date to use its local time-of-day in the given tz */
    baseTime?: Date; // defaults to "now"
    /** Minutes to add (or subtract) from service time */
    offsetMins?: number; // default 0
    /** Agency timezone (IANA) used when baseTime is used or when defaulting to now */
    tz?: string; // default "America/Edmonton"
    /** Hour when the service day starts (0–23). Typical: 5 */
    serviceDayStartHour?: number; // default
};

/**
 * getGtfsServiceTime
 * Returns GTFS "service time" (may be >= 24:00:00) as HH:mm:ss
 */
export function getGtfsServiceTime(
    opts: GetGtfsServiceTimeOptions = {}
): ServiceTime {
    const tz = opts.tz ?? 'America/Edmonton';
    const cut = clampHour(opts.serviceDayStartHour ?? SERVICE_DAY_START_HOUR);
    const offset = opts.offsetMins ?? 0;

    // 1) Determine local wall clock time-of-day (hh:mm:ss)
    const t = opts.clockTime
        ? parseClockTime(opts.clockTime) // trust caller's 0–23h time
        : timePartsInTz(opts.baseTime ?? new Date(), tz); // extract time-of-day in tz

    // 2) Convert to service-seconds (add 24h if before cutover)
    let serviceSecs = t.h * 3600 + t.m * 60 + t.s + (t.h < cut ? 24 * 3600 : 0);

    // 3) Apply offset in *service* minutes
    serviceSecs += Math.trunc(offset * 60);

    // Clamp at 0 (no negative service time)
    if (serviceSecs < 0) serviceSecs = 0;

    // 4) Format HH:mm:ss (HH can be >= 24)
    const hh = Math.floor(serviceSecs / 3600);
    const mm = Math.floor((serviceSecs % 3600) / 60);
    const ss = serviceSecs % 60;

    return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}` as ServiceTime;
}

/**
 * convertServiceTimeToClockTime
 *  "25:00:01" -> "01:00:01" (drops the +24h component)
 */
export function convertServiceTimeToClockTime(serviceTime: string): ClockTime {
    const [h, m, s] = serviceTime.split(':').map(Number);
    if (![h, m, s].every(Number.isFinite)) {
        throw new Error(`Invalid serviceTime: "${serviceTime}"`);
    }
    const clockH = ((h % 24) + 24) % 24; // safe modulo
    return `${pad2(clockH)}:${pad2(m)}:${pad2(s)}` as ClockTime;
}
