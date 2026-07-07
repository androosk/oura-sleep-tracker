import { formatClockTime, formatDayLabel, formatDuration, formatPercent } from '../lib/format';

// jest.config.js pins TZ to America/Chicago (CDT, UTC-5 in July) so the
// timezone-conversion expectations below are exact.

describe('formatDuration (US-006/US-008)', () => {
  it.each([
    [27120, '7h 32m'],
    [27720, '7h 42m'],
    [3600, '1h 0m'],
    [2700, '45m'],
    [540, '9m'],
    [0, '0m'],
  ])('formats %d seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it('rounds to the nearest minute', () => {
    expect(formatDuration(89)).toBe('1m');
    expect(formatDuration(29)).toBe('0m');
  });
});

describe('formatClockTime (US-008: device-local timezone)', () => {
  it('converts a -07:00 timestamp to Chicago wall time', () => {
    expect(formatClockTime('2026-07-02T23:41:00-07:00')).toBe('1:41 AM');
    expect(formatClockTime('2026-07-03T07:23:00-07:00')).toBe('9:23 AM');
  });

  it('handles UTC timestamps', () => {
    expect(formatClockTime('2026-07-03T06:41:00Z')).toBe('1:41 AM');
  });
});

describe('formatPercent', () => {
  it('renders whole percents', () => {
    expect(formatPercent(98)).toBe('98%');
  });
});

describe('formatDayLabel (US-009: calendar dates are never timezone-shifted)', () => {
  it('formats a calendar date without shifting it', () => {
    // Midnight-UTC parsing would render these as the previous day in Chicago.
    expect(formatDayLabel('2026-07-03')).toBe('Fri, Jul 3');
    expect(formatDayLabel('2026-01-01')).toBe('Thu, Jan 1');
  });
});
