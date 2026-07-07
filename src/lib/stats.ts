import { NotImplementedError } from './notImplemented';

import type { IsoDate } from '../api/types';

/**
 * Aggregations for the Trends screen.
 *
 * Contract (src/__tests__/stats.test.ts):
 * - Averages ignore null values entirely (nights without data don't drag the
 *   average down).
 * - averageScore rounds to the nearest integer; empty/all-null input -> null.
 * - averageDurationSeconds rounds to the nearest second; same null rule.
 */

export interface TrendPoint {
  day: IsoDate;
  score: number | null;
  totalSleepSeconds: number | null;
}

export function averageScore(_points: TrendPoint[]): number | null {
  throw new NotImplementedError('averageScore');
}

export function averageDurationSeconds(_points: TrendPoint[]): number | null {
  throw new NotImplementedError('averageDurationSeconds');
}
