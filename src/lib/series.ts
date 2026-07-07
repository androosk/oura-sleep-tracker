import type { SampleSeries } from '../api/types';

/**
 * Prepares sampled overnight series (HR, HRV) for charting. null items split
 * the series into separate polyline runs: gaps stay gaps, the chart must not
 * interpolate across missing readings.
 */

export interface SeriesPoint {
  offsetSeconds: number;
  value: number;
}

export function splitSeriesAtGaps(series: SampleSeries): SeriesPoint[][] {
  const runs: SeriesPoint[][] = [];
  let current: SeriesPoint[] = [];
  series.items.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) {
        runs.push(current);
        current = [];
      }
      return;
    }
    current.push({ offsetSeconds: index * series.interval, value });
  });
  if (current.length > 0) {
    runs.push(current);
  }
  return runs;
}
