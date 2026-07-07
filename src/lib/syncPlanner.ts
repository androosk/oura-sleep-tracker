import { NotImplementedError } from './notImplemented';

import type { DateRange, IsoDate } from '../api/types';

/**
 * Decides which date windows to fetch (FR-11: last 90 days up front, older
 * history lazily backfilled as the user scrolls).
 *
 * Contract (src/__tests__/syncPlanner.test.ts):
 * - initialSyncRange('2026-07-06') -> { start: '2026-04-08', end: '2026-07-06' }
 *   (a 90-day inclusive window ending today).
 * - nextBackfillRange('2026-04-08') -> { start: '2026-01-08', end: '2026-04-07' }
 *   (the adjacent 90-day inclusive window immediately before the oldest
 *   already-synced day).
 */

export function initialSyncRange(_today: IsoDate): DateRange {
  throw new NotImplementedError('initialSyncRange');
}

export function nextBackfillRange(_oldestSyncedDay: IsoDate): DateRange {
  throw new NotImplementedError('nextBackfillRange');
}
