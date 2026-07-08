import { parseSleepPhases } from './phases';
import { splitSeriesAtGaps } from './series';

import type { IsoDate, LocalizedTimestamp, SleepDocument } from '../api/types';
import type { StageSegment } from './phases';
import type { SeriesPoint } from './series';

/**
 * Stitches a day's contributing sleep sessions into one composite night —
 * the primary view for fragmented (polyphasic) sleep, where Oura delivers
 * several `sleep`-type documents instead of one `long_sleep`.
 *
 * All offsets are seconds from the earliest bedtime_start, computed from
 * epoch time so differing UTC offsets between fragments cannot skew
 * placement. Gaps between fragments render as awake segments but do not
 * count toward the awake *total* — totals report recorded stage time only.
 * Contract: src/__tests__/composite.test.ts.
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

const epochMs = (timestamp: LocalizedTimestamp): number => new Date(timestamp).getTime();

function sumOrNull(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  return present.length > 0 ? present.reduce((sum, value) => sum + value, 0) : null;
}

function minOrNull(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  return present.length > 0 ? Math.min(...present) : null;
}

/** Average of each fragment's mean, weighted by its sleep duration. */
function weightedAverage(pairs: [number | null, number | null][]): number | null {
  const present = pairs.filter((pair): pair is [number, number | null] => pair[0] !== null);
  if (present.length === 0) return null;
  const totalWeight = present.reduce((sum, [, weight]) => sum + (weight ?? 0), 0);
  if (totalWeight === 0) {
    return present.reduce((sum, [value]) => sum + value, 0) / present.length;
  }
  return present.reduce((sum, [value, weight]) => sum + value * (weight ?? 0), 0) / totalWeight;
}

export function buildCompositeNight(sessions: SleepDocument[]): CompositeNight | null {
  if (sessions.length === 0) return null;
  const sorted = [...sessions].sort((a, b) => epochMs(a.bedtime_start) - epochMs(b.bedtime_start));
  const first = sorted[0];
  const lastEnding = sorted.reduce((a, b) =>
    epochMs(a.bedtime_end) >= epochMs(b.bedtime_end) ? a : b,
  );
  const startMs = epochMs(first.bedtime_start);
  const timeInBedSeconds = (epochMs(lastEnding.bedtime_end) - startMs) / 1000;

  // Stage timeline: fragment phases at true offsets, inter-fragment gaps as
  // awake. push() merges contiguous same-stage segments so a gap fuses with
  // an adjacent awake stage.
  const segments: StageSegment[] = [];
  const push = (
    stage: StageSegment['stage'],
    startOffsetSeconds: number,
    durationSeconds: number,
  ) => {
    if (durationSeconds <= 0) return;
    const previous = segments[segments.length - 1];
    if (
      previous &&
      previous.stage === stage &&
      previous.startOffsetSeconds + previous.durationSeconds === startOffsetSeconds
    ) {
      previous.durationSeconds += durationSeconds;
    } else {
      segments.push({ stage, startOffsetSeconds, durationSeconds });
    }
  };

  let coveredUpTo = 0;
  for (const doc of sorted) {
    const docOffset = (epochMs(doc.bedtime_start) - startMs) / 1000;
    push('awake', coveredUpTo, docOffset - coveredUpTo);
    if (doc.sleep_phase_5_min) {
      for (const segment of parseSleepPhases(doc.sleep_phase_5_min)) {
        push(segment.stage, docOffset + segment.startOffsetSeconds, segment.durationSeconds);
      }
      coveredUpTo = docOffset + doc.sleep_phase_5_min.length * 300;
    } else {
      const span = (epochMs(doc.bedtime_end) - epochMs(doc.bedtime_start)) / 1000;
      push('unknown', docOffset, span);
      coveredUpTo = docOffset + span;
    }
  }

  // Vitals: every fragment's sample runs, shifted to composite offsets.
  const shiftRuns = (select: (doc: SleepDocument) => SleepDocument['heart_rate']) =>
    sorted.flatMap((doc) => {
      const series = select(doc);
      if (!series) return [];
      const seriesOffset = (epochMs(series.timestamp) - startMs) / 1000;
      return splitSeriesAtGaps(series).map((run) =>
        run.map((point) => ({ ...point, offsetSeconds: point.offsetSeconds + seriesOffset })),
      );
    });

  const totals: CompositeTotals = {
    asleep: sumOrNull(sorted.map((doc) => doc.total_sleep_duration)),
    deep: sumOrNull(sorted.map((doc) => doc.deep_sleep_duration)),
    rem: sumOrNull(sorted.map((doc) => doc.rem_sleep_duration)),
    light: sumOrNull(sorted.map((doc) => doc.light_sleep_duration)),
    awake: sumOrNull(sorted.map((doc) => doc.awake_time)),
  };

  return {
    day: first.day,
    bedtimeStart: first.bedtime_start,
    bedtimeEnd: lastEnding.bedtime_end,
    segments,
    totals,
    timeInBedSeconds,
    efficiencyPercent:
      totals.asleep === null || timeInBedSeconds === 0
        ? null
        : Math.round((totals.asleep / timeInBedSeconds) * 100),
    latencySeconds: first.latency,
    lowestHeartRate: minOrNull(sorted.map((doc) => doc.lowest_heart_rate)),
    averageHeartRate: weightedAverage(
      sorted.map((doc) => [doc.average_heart_rate, doc.total_sleep_duration]),
    ),
    averageHrv: weightedAverage(sorted.map((doc) => [doc.average_hrv, doc.total_sleep_duration])),
    heartRateRuns: shiftRuns((doc) => doc.heart_rate),
    hrvRuns: shiftRuns((doc) => doc.hrv),
  };
}
