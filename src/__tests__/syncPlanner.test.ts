import { addDays, initialSyncRange, nextBackfillRange } from '../lib/syncPlanner';

describe('syncPlanner (FR-11: 90 days up front, lazy backfill)', () => {
  it('plans a 90-day inclusive initial window ending today', () => {
    expect(initialSyncRange('2026-07-06')).toEqual({ start: '2026-04-08', end: '2026-07-06' });
  });

  it('handles month/year boundaries', () => {
    expect(initialSyncRange('2026-01-15')).toEqual({ start: '2025-10-18', end: '2026-01-15' });
  });

  it('plans the adjacent earlier 90-day window for backfill', () => {
    expect(nextBackfillRange('2026-04-08')).toEqual({ start: '2026-01-08', end: '2026-04-07' });
  });
});

describe('addDays', () => {
  it.each([
    ['2026-07-06', 1, '2026-07-07'],
    ['2026-04-30', 1, '2026-05-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-03-01', -1, '2026-02-28'],
  ])('%s %+d day(s) is %s', (day, delta, expected) => {
    expect(addDays(day, delta)).toBe(expected);
  });
});
