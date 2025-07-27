import { it, describe, beforeEach, afterEach, expect, vi } from 'vitest';
import {
    getServiceDate,
    getGtfsServiceTime,
    padTimeStamp,
    convertServiceTimeToClockTime,
} from '@/lib/time-utils';

const setClock = (y: number, m: number, d: number, h: number, min: number) =>
    vi.setSystemTime(new Date(y, m, d, h, min, 0));

describe('time-utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('respects targetTime exactly', () => {
        expect(getGtfsServiceTime('25:00:00')).toBe('25:00:00');
    });

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

        it('respects targetTime exactly', () => {
            expect(getGtfsServiceTime('25:00:00')).toBe('25:00:00');
        });

        //  it('getGtfsServiceTime should return a service time in the future if offSetInMinutes is provided', () => {
        //      // Mock fake system date to specific date for testing
        //      const time = new Date(2025, 0, 2, 23, 24, 0);
        //      vi.setSystemTime(time);

        //      const currentServiceTime = getGtfsServiceTime(undefined, 60);

        //      expect(currentServiceTime).toBe('24:24:00');
        //  });
        it('shifts time when offset is supplied', () => {
            setClock(2025, 0, 2, 23, 24);
            expect(getGtfsServiceTime(undefined, 60)).toBe('24:24:00');
            expect(getGtfsServiceTime('20:00:00', 60)).toBe('21:00:00');
        });
    });

    it('getServiceDate should return a service date that corresponds to the CURRENT days date if the current time is between `05:00:00` – `23:00:00`', () => {
        // Mock fake system date to specific date for testing
        const date = new Date(2025, 0, 2, 10, 24, 0);
        vi.setSystemTime(date);

        const currentDate = getServiceDate();

        expect(currentDate).toBe(20250102);
    });

    it('getServiceDate should return a service date that corresponds to the specified calendarDate if the current time is between `05:00:00` – `23:00:00`', () => {
        const date = new Date(2025, 0, 2, 23, 24, 0);
        vi.setSystemTime(date);

        const currentDate = getServiceDate({ calendarDate: '20250302' });

        expect(currentDate).toBe(20250302);
    });

    it('getServiceDate should return a service date that corresponds to the specified calendarDate if the current time is between `00:00:00` – `04:00:00`', () => {
        const date = new Date(2025, 0, 2, 0, 24, 0);
        vi.setSystemTime(date);

        const currentDate = getServiceDate({ calendarDate: '20250302' });

        expect(currentDate).toBe(20250301);
    });

    it('getServiceDate should return a service date that corresponds to the PREVIOUS days date if the current time is between `00:00:00` – `04:00:00`', () => {
        // Mock fake system date to specific date for testing
        const date = new Date(2025, 0, 2, 3, 24, 0);
        vi.setSystemTime(date);

        const currentDate = getServiceDate();

        expect(currentDate).toBe(20250101);
    });

    it('getServiceDate should return the correct service date if given a specific calendarDate and a targetTime between `00:00:00` – `04:00:00`', () => {
        // Mock fake system date to specific date for testing
        // const date = new Date(2025, 0, 2, 3, 24, 0);
        // vi.setSystemTime(date);

        const currentDate = getServiceDate({
            calendarDate: '20250102',
            targetTime: '01:00:00',
        });

        expect(currentDate).toBe(20250101);
    });

    describe('convertServiceTimeToClockTime', () => {
        it.each([
            ['25:00:00', '01:00:00'],
            ['11:00:00', '11:00:00'],
        ])('converts %s → %s', (input, expected) => {
            expect(convertServiceTimeToClockTime(input)).toBe(expected);
        });
    });
});
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
