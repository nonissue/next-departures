import { it, describe, beforeEach, afterEach, expect, vi } from 'vitest';
import getCurrentDate from './getCurrentDate.js';

describe('purchasing flow', () => {
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
});
