/**
 * Parser for Oura's sleep_phase_5_min string: one character per 5 minutes,
 * '1' deep, '2' light, '3' REM, '4' awake.
 */

export type SleepStage = 'deep' | 'light' | 'rem' | 'awake' | 'unknown';

export interface StageSegment {
  stage: SleepStage;
  startOffsetSeconds: number;
  durationSeconds: number;
}

const STAGE_BY_CHAR: Record<string, SleepStage> = {
  '1': 'deep',
  '2': 'light',
  '3': 'rem',
  '4': 'awake',
};

const SECONDS_PER_CHAR = 300;

export function parseSleepPhases(phase5min: string): StageSegment[] {
  const segments: StageSegment[] = [];
  for (let i = 0; i < phase5min.length; i++) {
    const stage = STAGE_BY_CHAR[phase5min[i]] ?? 'unknown';
    const last = segments[segments.length - 1];
    if (last && last.stage === stage) {
      last.durationSeconds += SECONDS_PER_CHAR;
    } else {
      segments.push({
        stage,
        startOffsetSeconds: i * SECONDS_PER_CHAR,
        durationSeconds: SECONDS_PER_CHAR,
      });
    }
  }
  return segments;
}

/** Sums segment durations per stage; stages with no segments are 0. */
export function stageTotals(segments: StageSegment[]): Record<SleepStage, number> {
  const totals: Record<SleepStage, number> = { deep: 0, light: 0, rem: 0, awake: 0, unknown: 0 };
  for (const segment of segments) {
    totals[segment.stage] += segment.durationSeconds;
  }
  return totals;
}
