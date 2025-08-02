import { SERVICE_DAY_START_HOUR } from '@/config';
import { ClockTime, ServiceTime } from '@/types/global';

// interface ServiceDateOptions {
//     calendarDate?: string; // why the fuck is this a string, shouldnt it be a number?
//     targetTime?: string;
// }

/**
 * getServiceDate()
 * called with no params -> returns "service date" based on current time and current calendar date
 * called with calendarDate -> returns "service date" based on provided calendarDate and current time
 * called with targetTime -> returns "service date" based on current calendar date and provided time
 * called with calendarDate and targetTime -> returns "service date" based on both provided parameters
 * @param calendarDate - string - we accept a string representing the calendar date (string rather than number so we can slice it)
 * @param targetTime - string (optional) - a string representing the target time eg "25:00:01"
 * @returns number - a number representing the computed service date in the form YYYYMMDD -> 20250727
 */
// export const getServiceDate = ({
//     calendarDate,
//     targetTime,
// }: ServiceDateOptions = {}): number => {
//     const now = new Date();
//     const timeStr = targetTime ?? now.toTimeString().slice(0, 8);
//     const [hours] = timeStr.split(':').map(Number);

//     // calendarDate is a string, even though we return a number representing date
//     // this is so we can slice it / parse it easily. if we accepted a number we would
//     // just have to convert it to a string anyway
//     const baseDate = calendarDate
//         ? new Date(
//               Number(calendarDate.slice(0, 4)), // year
//               Number(calendarDate.slice(4, 6)) - 1, // monthIndex (starts at 0)
//               Number(calendarDate.slice(6, 8)) // day
//           )
//         : now;

//     const adjustedDate =
//         hours < SERVICE_DAY_END_HOUR
//             ? new Date(
//                   baseDate.getFullYear(),
//                   baseDate.getMonth(),
//                   baseDate.getDate() - 1
//               )
//             : new Date(
//                   baseDate.getFullYear(),
//                   baseDate.getMonth(),
//                   baseDate.getDate()
//               );

//     return (
//         adjustedDate.getFullYear() * 10000 +
//         (adjustedDate.getMonth() + 1) * 100 +
//         adjustedDate.getDate()
//     );
// };

type ServiceDateOptions = {
    /** Base calendar date; if omitted, uses "today" in tz. */
    calendarDate?: string | number | Date; // "20250801" | 20250801 | Date
    /** GTFS-style time; may exceed 24h (e.g., "25:10:00"). If omitted, uses now in tz. */
    targetTime?: string; // "HH:mm:ss"
    /** Local agency TZ (IANA). */
    tz?: string; // default: "America/Edmonton"
    /** Hour of cutover when a new service day starts (0–23). */
    serviceDayStartHour?: number; // default: 3
};

/** Public API */
export function getServiceDate(opts: ServiceDateOptions = {}): number {
    const tz = opts.tz ?? 'America/Edmonton';
    const cut = clampHour(opts.serviceDayStartHour ?? SERVICE_DAY_END_HOUR);

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

/* ---------------------- helpers (pure) ---------------------- */

type Ymd = { y: number; m: number; d: number };

function clampHour(h: number) {
    return Math.min(23, Math.max(0, Math.floor(h)));
}

function resolveYmd(
    input: string | number | Date | undefined,
    tz: string
): Ymd {
    if (input instanceof Date) return dateToYmdInTz(input, tz);

    if (typeof input === 'string' || typeof input === 'number') {
        const s = String(input).trim();
        if (!/^\d{8}$/.test(s))
            throw new Error(`calendarDate must be YYYYMMDD, got "${s}"`);
        return { y: +s.slice(0, 4), m: +s.slice(4, 6), d: +s.slice(6, 8) };
    }

    // default: today in tz
    return dateToYmdInTz(new Date(), tz);
}

function resolveHour(targetTime: string | undefined, tz: string): number {
    if (targetTime) {
        const [h] = targetTime.split(':').map(Number);
        if (!Number.isFinite(h) || h < 0)
            throw new Error(`Invalid targetTime "${targetTime}"`);
        return h; // may be >= 24 (GTFS after-midnight)
    }
    // hour "now" in tz (24h clock)
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        hour: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date());
    const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';
    return Number(hourStr);
}

function dateToYmdInTz(d: Date, tz: string): Ymd {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(d);
    const y = Number(parts.find((p) => p.type === 'year')?.value);
    const m = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return { y, m, d: day };
}

function ymdToNumber({ y, m, d }: Ymd): number {
    return y * 10000 + m * 100 + d;
}

function addDays({ y, m, d }: Ymd, delta: number): Ymd {
    // do calendar math without timezones
    const dt = new Date(Date.UTC(y, m - 1, d + delta));
    return {
        y: dt.getUTCFullYear(),
        m: dt.getUTCMonth() + 1,
        d: dt.getUTCDate(),
    };
}

function pad2(n: number) {
    return String(Math.trunc(n)).padStart(2, '0');
}

function parseClockTime(t: string) {
    // Accept H:MM:SS or HH:MM:SS with 0–23 hours
    const m = /^(\d{1,2}):([0-5]\d):([0-5]\d)$/.exec(t);
    if (!m) throw new Error(`clockTime must be "HH:MM:SS", got "${t}"`);
    const h = Number(m[1]),
        mm = Number(m[2]),
        s = Number(m[3]);
    if (h < 0 || h > 23)
        throw new Error(`clockTime hour out of range (0–23): ${h}`);
    return { h, m: mm, s };
}

function timePartsInTz(d: Date, tz: string) {
    // Pull hour/min/sec in the agency TZ using Intl (no external deps)
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });
    const parts = fmt.formatToParts(d);
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const s = Number(parts.find((p) => p.type === 'second')?.value ?? '0');
    return { h, m, s };
}

/**
 * getGtfsServiceTime
 * @param clockTime - ClockTime (optional) - a string in format "HH:MM:SS" that represents the 24 clock time to convert into service time
 * @param offSetInMinutes - number, optional - a number representing how many minutes should be added to returned service time
 * @throws Error if stopId isn't provided
 * @returns string - a string in the format "HH:MM:SS" representing a time in the current service day (eg. more than 24 hours)
 */
// export const getGtfsServiceTime = (
//     clockTime?: ClockTime,
//     offsetInMinutes?: number
// ): ServiceTime => {
//     // 1. Build a Date that represents the *base* time today
//     const base = (() => {
//         if (clockTime) {
//             const [hh, mm, ss] = clockTime.split(':').map(Number);
//             const d = new Date(); // today
//             d.setHours(hh, mm, ss, 0);
//             return d;
//         }
//         return new Date(); // now
//     })();

//     // 2. Apply the offset, if any
//     if (offsetInMinutes && offsetInMinutes !== 0) {
//         base.setMinutes(base.getMinutes() + offsetInMinutes);
//     }

//     // 3. Convert to service‑day HH:mm:ss
//     const hours = base.getHours();
//     const minutes = base.getMinutes();
//     const seconds = base.getSeconds();

//     const serviceHours = hours < SERVICE_DAY_END_HOUR ? hours + 24 : hours;

//     const hh = String(serviceHours).padStart(2, '0');
//     const mm = String(minutes).padStart(2, '0');
//     const ss = String(seconds).padStart(2, '0');

//     return `${hh}:${mm}:${ss}` as ServiceTime;
// };

/**
 * Todo
 * @param serviceTime string - hh:mm:ss -> "25:00:01"
 * @returns string - hh:mm:ss -> 00:00:01
 * taken from `node-gtfs`
 */
// export const convertServiceTimeToClockTime = (serviceTime: string) => {
//     const [hours, minutes, seconds] = serviceTime.split(':').map(Number);
//     const clockTime = `${hours > LAST_CLOCK_HOUR ? hours - HOURS_IN_A_DAY : hours}:${minutes}:${seconds}`;
//     return padTimeStamp(clockTime);
// };

/**
 * Ensures time components have leading zeros (e.g., "9:5:1" -> "09:05:01")
 * @param time Time string in HH:mm:ss format
 * @returns Formatted time string with leading zeros, or null if invalid format
 */
// export function padTimeStamp(time: string) {
//     const split = time
//         .split(':')
//         .map((d) => String(Number(d)).padStart(2, '0'));
//     if (split.length !== 3) {
//         throw new Error(
//             "padTimeStamp: input must be a string in the form 'HH:MM:SS'"
//         );
//     }

//     return split.join(':');
// }

// Types
// export type ClockTime = `${number}:${number}:${number}`;
// export type ServiceTime = `${number}:${number}:${number}`;

type GetGtfsServiceTimeOptions = {
    /** Either specify the wall-clock time-of-day... */
    clockTime?: ClockTime; // "HH:mm:ss" (0–23 hours)
    /** ...or give a Date to use its local time-of-day in the given tz */
    baseTime?: Date; // defaults to "now"
    /** Minutes to add (or subtract) from service time */
    offsetMins?: number; // default 0
    /** Agency timezone (IANA) used when baseTime is used or when defaulting to now */
    tz?: string; // default "America/Edmonton"
    /** Hour when the service day starts (0–23). Typical: 3 */
    serviceDayStartHour?: number; // default 3
};

/**
 * getGtfsServiceTime
 * Returns GTFS "service time" (may be >= 24:00:00) as HH:mm:ss
 */
export function getGtfsServiceTime(
    opts: GetGtfsServiceTimeOptions = {}
): ServiceTime {
    const tz = opts.tz ?? 'America/Edmonton';
    const cut = clampHour(opts.serviceDayStartHour ?? 3);
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

/** Ensures "9:5:1" -> "09:05:01" (and validates basic shape) */
export function padTimeStamp(time: string): ClockTime {
    const parts = time.split(':');
    if (parts.length !== 3) {
        throw new Error(`padTimeStamp expects "HH:MM:SS", got "${time}"`);
    }
    const [h, m, s] = parts.map((d) => String(Number(d)).padStart(2, '0'));
    return `${h}:${m}:${s}` as ClockTime;
}

/* ---------------- helpers ---------------- */
