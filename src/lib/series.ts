import { NotImplementedError } from './notImplemented';

import type { SampleSeries } from '../api/types';

/**
 * Prepares sampled overnight series (HR, HRV) for charting.
 *
 * Contract (src/__tests__/series.test.ts):
 * - null items split the series into separate polyline runs: gaps stay gaps,
 *   the chart must not interpolate across missing readings.
 * - Offsets are seconds from the series start (index * interval).
 * - A series that is all nulls yields [].
 */

export interface SeriesPoint {
  offsetSeconds: number;
  value: number;
}

export function splitSeriesAtGaps(_series: SampleSeries): SeriesPoint[][] {
  throw new NotImplementedError('splitSeriesAtGaps');
}
