import { describe, it, expect } from 'vitest';
import {
  getLocalDateString,
  parseLocalDate,
  isValidDateString,
  isToday,
  isOverdue,
  isUpcoming,
  compareDates,
  formatDisplayDate,
} from '../src/utils/date';

describe('Date Utilities (Calendar dates without timezone shift)', () => {
  it('formats Date into YYYY-MM-DD local calendar string', () => {
    const d = new Date(2026, 9, 15); // Month is 0-indexed: 9 is October
    expect(getLocalDateString(d)).toBe('2026-10-15');
  });

  it('parses YYYY-MM-DD correctly', () => {
    const d = parseLocalDate('2026-10-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(15);
  });

  it('validates YYYY-MM-DD format', () => {
    expect(isValidDateString('2026-10-15')).toBe(true);
    expect(isValidDateString('invalid-date')).toBe(false);
    expect(isValidDateString('2026-02-31')).toBe(false);
  });

  it('accurately identifies today, overdue, and upcoming dates', () => {
    const today = getLocalDateString();
    expect(isToday(today)).toBe(true);
    expect(isOverdue(today)).toBe(false);
    expect(isUpcoming(today)).toBe(false);

    const pastDate = '2020-01-01';
    expect(isOverdue(pastDate)).toBe(true);
    expect(isUpcoming(pastDate)).toBe(false);
    expect(isToday(pastDate)).toBe(false);

    const futureDate = '2099-12-31';
    expect(isUpcoming(futureDate)).toBe(true);
    expect(isOverdue(futureDate)).toBe(false);
    expect(isToday(futureDate)).toBe(false);
  });

  it('compares dates properly with null values last', () => {
    expect(compareDates('2026-10-14', '2026-10-15')).toBeLessThan(0);
    expect(compareDates('2026-10-15', '2026-10-14')).toBeGreaterThan(0);
    expect(compareDates('2026-10-15', '2026-10-15')).toBe(0);
    expect(compareDates('2026-10-15', null)).toBeLessThan(0);
    expect(compareDates(null, '2026-10-15')).toBeGreaterThan(0);
    expect(compareDates(null, null)).toBe(0);
  });

  it('formats display dates for Today, Tomorrow, and Yesterday', () => {
    const today = getLocalDateString();
    expect(formatDisplayDate(today)).toBe('Today');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatDisplayDate(getLocalDateString(tomorrow))).toBe('Tomorrow');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDisplayDate(getLocalDateString(yesterday))).toBe('Yesterday');
  });
});
