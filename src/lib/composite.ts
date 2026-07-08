import type { IsoDate, LocalizedTimestamp, SleepDocument } from '../api/types';
import type { StageSegment } from './phases';
import type { SeriesPoint } from './series';

/**
 * Stitches a day's contributing sleep sessions into one composite night —
 * the primary view for fragmented (polyphasic) sleep, where Oura delivers
 * several `sleep`-type documents instead of one `long_sleep`.
 *
 * Contract (src/__tests__/composite.test.ts):
 * - Span runs from the earliest bedtime_start to the latest bedtime_end;
 *   offsets are seconds from the composite start, computed from epoch time
 *   so differing UTC offsets between fragments cannot skew placement.
 * - Fragment stages land at true clock offsets; the gap between fragments
 *   becomes an 'awake' segment, merging with adjacent awake stages.
 * - A fragment without a phase string renders as one 'unknown' segment
 *   covering that fragment.
 * - totals sum the fragments' stage-duration fields (null when all null);
 *   timeInBedSeconds is the full span; efficiency = round(asleep/span·100);
 *   latency comes from the first fragment.
 * - heartRateRuns/hrvRuns place every fragment's samples at composite
 *   offsets; runs never bridge a gap (between or within fragments).
 * - lowestHeartRate = min across fragments; averageHeartRate/averageHrv are
 *   weighted by fragment total_sleep_duration.
 * - Single fragment in → values equivalent to that fragment (regression).
 * - Empty input → null.
 */

export interface CompositeTotals {
  asleep: number | null;
  deep: number | null;
  rem: number | null;
  light: number | null;
  awake: number | null;
}

export interface CompositeNight {
  day: IsoDate;
  bedtimeStart: LocalizedTimestamp;
  bedtimeEnd: LocalizedTimestamp;
  segments: StageSegment[];
  totals: CompositeTotals;
  timeInBedSeconds: number;
  efficiencyPercent: number | null;
  latencySeconds: number | null;
  lowestHeartRate: number | null;
  averageHeartRate: number | null;
  averageHrv: number | null;
  heartRateRuns: SeriesPoint[][];
  hrvRuns: SeriesPoint[][];
}

export function buildCompositeNight(_sessions: SleepDocument[]): CompositeNight | null {
  throw new Error(
    'buildCompositeNight is not implemented — behavior is pinned by composite.test.ts',
  );
}
