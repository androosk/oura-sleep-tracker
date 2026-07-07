import type { IsoDate } from '../api/types';

/**
 * Aggregations for the Trends screen. Averages ignore null values entirely —
 * nights without data don't drag the average down.
 */

export interface TrendPoint {
  day: IsoDate;
  score: number | null;
  totalSleepSeconds: number | null;
}

function roundedAverage(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) return null;
  return Math.round(present.reduce((sum, value) => sum + value, 0) / present.length);
}

export function averageScore(points: TrendPoint[]): number | null {
  return roundedAverage(points.map((point) => point.score));
}

export function averageDurationSeconds(points: TrendPoint[]): number | null {
  return roundedAverage(points.map((point) => point.totalSleepSeconds));
}
