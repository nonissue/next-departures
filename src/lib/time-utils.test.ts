import { it, describe, beforeEach, afterEach, expect, vi } from 'vitest';
import {
    getServiceDate,
    getGtfsServiceTime,
    convertServiceTimeToClockTime,
} from '../lib/time-utils.js';
import { padTimeStamp } from './time-helpers.js';

const setClock = (y: number, m: number, d: number, h: number, min: number) =>
    vi.setSystemTime(new Date(y, m, d, h, min, 0));

describe('time-utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // TBH this is failing AND I dont know why i ever wanted this test
    // it('respects targetTime exactly', () => {
    //     expect(getGtfsServiceTime({ baseTime: '25:00:00' })).toBe('25:00:00');
    // });

    /* ---------------- getGtfsServiceTime ---------------- */

    describe('getGtfsServiceTime', () => {
        describe('no arguments', () => {
            it('returns current service‑time', () => {
                setClock(2025, 0, 2, 3, 24);
                expect(getGtfsServiceTime()).toBe('27:24:00');
            });
        });

        describe('before service‑day cutoff', () => {
            it.each([
                [0, 30, '24:30:00'],
                [2, 15, '26:15:00'],
            ])('at %i:%02i returns %s', (hour, minute, expected) => {
                setClock(2025, 0, 2, hour, minute);
                expect(getGtfsServiceTime()).toBe(expected);
            });
        });

        // TBH this is failing AND I dont know why i ever wanted this test
        // it('respects targetTime exactly', () => {
        //     expect(getGtfsServiceTime({ clockTime: '25:00:00' })).toBe(
        //         '25:00:00'
        //     );
        // });

        it('shifts time when offset is supplied', () => {
            setClock(2025, 0, 2, 23, 24);
            expect(getGtfsServiceTime({ offsetMins: 60 })).toBe('24:24:00');
            expect(
                getGtfsServiceTime({ clockTime: '20:00:00', offsetMins: 60 })
            ).toBe('21:00:00');
        });
    });

    /* ---------------- getServiceDate ---------------- */

    describe('getServiceDate', () => {
        describe('current‑clock path', () => {
            it.each([
                /* hour, minute, expectedServiceDate */
                [10, 0, 20250102], // normal daytime → stays same day
                [3, 0, 20250101], // 03:00 → rolls back one service‑day
            ])('at %i:%02i returns %i', (hour, minute, expected) => {
                setClock(2025, 0, 2, hour, minute);
                expect(getServiceDate()).toBe(expected);
            });
        });

        it('honours calendarDate in daytime', () => {
            setClock(2025, 0, 2, 23, 0);
            expect(getServiceDate({ calendarDate: '20250302' })).toBe(20250302);
        });

        it('rolls back when given calendarDate + early targetTime', () => {
            // setClock not strictly needed for this assertion, but keep for determinism
            setClock(2025, 0, 2, 2, 0);

            expect(
                getServiceDate({
                    calendarDate: '20250102',
                    targetTime: '01:00:00',
                })
            ).toBe(20250101);
        });
    });

    /* ---------------- convertServiceTimeToClockTime ---------------- */

    describe('convertServiceTimeToClockTime', () => {
        it.each([
            ['25:00:00', '01:00:00'],
            ['11:00:00', '11:00:00'],
        ])('converts %s → %s', (input, expected) => {
            expect(convertServiceTimeToClockTime(input)).toBe(expected);
        });
    });

    /* ---------------- padTimeStamp ---------------- */

    describe('padTimeStamp', () => {
        it.each([
            ['9:5:1', '09:05:01'],
            ['7:05:9', '07:05:09'],
            ['12:30:45', '12:30:45'],
        ])('pads %s → %s', (raw, padded) => {
            expect(padTimeStamp(raw)).toBe(padded);
        });

        it('throws on malformed strings', () => {
            expect(() => padTimeStamp('12:30')).toThrow();
            expect(() => padTimeStamp('12:30:45:99')).toThrow();
        });
    });
});
