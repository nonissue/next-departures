import { it, describe, beforeEach, afterEach, expect, vi } from 'vitest';
import { getServiceDate, getGtfsServiceTime } from './time-utils.js';

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
