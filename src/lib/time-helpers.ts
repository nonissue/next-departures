import { ClockTime } from '@/types/global';

export type Ymd = { y: number; m: number; d: number };

export function clampHour(h: number) {
    return Math.min(23, Math.max(0, Math.floor(h)));
}

export function resolveYmd(
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

export function resolveHour(
    targetTime: string | undefined,
    tz: string
): number {
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

export function dateToYmdInTz(d: Date, tz: string): Ymd {
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

export function ymdToNumber({ y, m, d }: Ymd): number {
    return y * 10000 + m * 100 + d;
}

export function addDays({ y, m, d }: Ymd, delta: number): Ymd {
    // do calendar math without timezones
    const dt = new Date(Date.UTC(y, m - 1, d + delta));
    return {
        y: dt.getUTCFullYear(),
        m: dt.getUTCMonth() + 1,
        d: dt.getUTCDate(),
    };
}

export function pad2(n: number) {
    return String(Math.trunc(n)).padStart(2, '0');
}

export function parseClockTime(t: string) {
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

export function timePartsInTz(d: Date, tz: string) {
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

/** Ensures "9:5:1" -> "09:05:01" (and validates basic shape) */
export function padTimeStamp(time: string): ClockTime {
    const parts = time.split(':');
    if (parts.length !== 3) {
        throw new Error(`padTimeStamp expects "HH:MM:SS", got "${time}"`);
    }
    const [h, m, s] = parts.map((d) => String(Number(d)).padStart(2, '0'));
    return `${h}:${m}:${s}` as ClockTime;
}
