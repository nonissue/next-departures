import { it, describe, beforeEach, afterEach, expect, vi } from 'vitest';
import {
    getServiceDate,
    getGtfsServiceTime,
    padTimeStamp,
} from '@/lib/time-utils';

describe('time-utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('getGtfsServiceTime should return a service time using the current clock time if no time is provided', () => {
        // Mock fake system date to specific date for testing
        const time = new Date(2025, 0, 2, 3, 24, 0);
        vi.setSystemTime(time);

        const currentServiceTime = getGtfsServiceTime();

        expect(currentServiceTime).toBe('27:24:00');
    });

    it('getGtfsServiceTime should return a service time normalized to service days if the current time is between `00:00:00` – `04:59:59`', () => {
        // Mock fake system date to specific date for testing
        const time = new Date(2025, 0, 2, 3, 24, 0);
        vi.setSystemTime(time);

        const currentServiceTime = getGtfsServiceTime();

        expect(currentServiceTime).toBe('27:24:00');
    });

    it('getGtfsServiceTime should return accept a targetTime and return the expected corresponding service time', () => {
        // Mock fake system date to specific date for testing
        const time = new Date(2025, 0, 2, 3, 24, 0);
        vi.setSystemTime(time);

        const currentServiceTime = getGtfsServiceTime('25:00:00');

        expect(currentServiceTime).toBe('25:00:00');
    });

    it('getGtfsServiceTime should return a normal clock time if the current time is between `05:00:00` – `23:59:59`', () => {
        // Mock fake system date to specific date for testing
        const time = new Date(2025, 0, 2, 10, 24, 0);
        vi.setSystemTime(time);

        const currentServiceTime = getGtfsServiceTime();

        expect(currentServiceTime).toBe('10:24:00');
    });

    it('getGtfsServiceTime should return a service time in the future if offSetInMinutes is provided', () => {
        // Mock fake system date to specific date for testing
        const time = new Date(2025, 0, 2, 23, 24, 0);
        vi.setSystemTime(time);

        const currentServiceTime = getGtfsServiceTime(undefined, 60);

        expect(currentServiceTime).toBe('24:24:00');
    });

    it('getGtfsServiceTime should return a service time for a specific clock time if only targetTime is provided', () => {
        const currentServiceTime = getGtfsServiceTime('01:00:00');
        expect(currentServiceTime).toBe('25:00:00');
    });

    it('getGtfsServiceTime should return a service time X minutes later than the provided targetTime if offSetInMinutes and targetTime are provided', () => {
        const currentServiceTime = getGtfsServiceTime('20:00:00', 60);
        expect(currentServiceTime).toBe('21:00:00');
    });

    it('getServiceDate should return a service date that corresponds to the CURRENT days date if the current time is between `05:00:00` – `23:00:00`', () => {
        // Mock fake system date to specific date for testing
        const date = new Date(2025, 0, 2, 10, 24, 0);
        vi.setSystemTime(date);

        const currentDate = getServiceDate();

        expect(currentDate).toBe(20250102);
    });

    it('getServiceDate should return a service date that corresponds to the PREVIOUS days date if the current time is between `00:00:00` – `04:00:00`', () => {
        // Mock fake system date to specific date for testing
        const date = new Date(2025, 0, 2, 3, 24, 0);
        vi.setSystemTime(date);

        const currentDate = getServiceDate();

        expect(currentDate).toBe(20250101);
    });
});

describe('padTimeStamp()', () => {
    it('pads single‑digit components with leading zeros', () => {
        expect(padTimeStamp('9:5:1')).toBe('09:05:01');
        expect(padTimeStamp('7:05:9')).toBe('07:05:09');
    });

    it('leaves already‑padded times unchanged', () => {
        expect(padTimeStamp('12:30:45')).toBe('12:30:45');
    });

    it('throws when the input is not in HH:mm:ss form', () => {
        expect(() => padTimeStamp('12:30')).toThrow(
            "padTimeStamp: input must be a string in the form 'HH:MM:SS'"
        );
        expect(() => padTimeStamp('12:30:45:99')).toThrow();
    });
});
