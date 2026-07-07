import { initialSyncRange, nextBackfillRange } from '../lib/syncPlanner';

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
