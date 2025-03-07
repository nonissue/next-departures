import { it, describe, beforeEach, afterEach, expect, vi } from 'vitest';
import {
  calculateSecondsFromMidnight,
  convertServiceTimeToClockTime,
  getCurrentDate,
  getCurrentServiceDate,
  getCurrentServiceTime,
} from './time-utils.js';

describe('time-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getCurrentDate should return the current date in the correct format', () => {
    // Mock fake system date to specific date for testing
    const date = new Date(2025, 0, 1); // FYI: month index starts at 0
    vi.setSystemTime(date);

    const currentDate = getCurrentDate();

    expect(currentDate).toBe(20250101);
  });

  it('getCurrentServiceDate should return a service date that corresponds to the CURRENT days date if the current time is between `05:00:00` – `23:00:00`', () => {
    // Mock fake system date to specific date for testing
    const date = new Date(2025, 0, 2, 10, 24, 0);
    vi.setSystemTime(date);

    const currentDate = getCurrentServiceDate();

    expect(currentDate).toBe(20250102);
  });

  it('getCurrentServiceDate should return a service date that corresponds to the PREVIOUS days date if the current time is between `00:00:00` – `04:00:00`', () => {
    // Mock fake system date to specific date for testing
    const date = new Date(2025, 0, 2, 3, 24, 0);
    vi.setSystemTime(date);

    const currentDate = getCurrentServiceDate();

    expect(currentDate).toBe(20250101);
  });

  it('getCurrentServiceTime should return a service time normalized to service days if the current time is between `00:00:00` – `04:59:59`', () => {
    // Mock fake system date to specific date for testing
    const time = new Date(2025, 0, 2, 3, 24, 0);
    vi.setSystemTime(time);

    const currentServiceTime = getCurrentServiceTime();

    expect(currentServiceTime).toBe('27:24:00');
  });

  it('getCurrentServiceTime should return a normal clock time if the current time is between `05:00:00` – `23:59:59`', () => {
    // Mock fake system date to specific date for testing
    const time = new Date(2025, 0, 2, 10, 24, 0);
    vi.setSystemTime(time);

    const currentServiceTime = getCurrentServiceTime();

    expect(currentServiceTime).toBe('10:24:00');
  });

  it('convertServiceTimeToClockTime correctly convert service time into clock time', () => {
    // Mock fake system date to specific date for testing
    const someServiceTime = '24:01:01';
    expect(convertServiceTimeToClockTime(someServiceTime)).toBe('00:01:01');
    expect(convertServiceTimeToClockTime('06:15:31')).toBe('06:15:31');
  });

  it('calculateSecondsFromMidnight correctly converts HH:MM:SS timestamp into seconds since midnight', () => {
    const eightAm = '08:00:00';
    const eightAmInSecondsFromMidnight = calculateSecondsFromMidnight(eightAm);

    expect(eightAmInSecondsFromMidnight).toBe(28800);
  });
  it('calculateSecondsFromMidnight correctly converts HH:MM:SS timestamp into seconds since midnight', () => {
    const eightAm = '0800:00';
    const eightAmInSecondsFromMidnight = calculateSecondsFromMidnight(eightAm);

    expect(eightAmInSecondsFromMidnight).toBe(null);
  });
});
