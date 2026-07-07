import { NotImplementedError } from '../lib/notImplemented';

/**
 * Parser for Oura's sleep_phase_5_min string: one character per 5 minutes,
 * '1' deep, '2' light, '3' REM, '4' awake.
 *
 * Contract (src/__tests__/phases.test.ts):
 * - Consecutive identical stages merge into one segment.
 * - Offsets/durations are in seconds from bedtime_start (1 char = 300 s).
 * - Unrecognized characters become 'unknown' segments — never a crash.
 * - Empty string parses to [].
 */

export type SleepStage = 'deep' | 'light' | 'rem' | 'awake' | 'unknown';

export interface StageSegment {
  stage: SleepStage;
  startOffsetSeconds: number;
  durationSeconds: number;
}

export function parseSleepPhases(_phase5min: string): StageSegment[] {
  throw new NotImplementedError('parseSleepPhases');
}

/** Sums segment durations per stage; stages with no segments are 0. */
export function stageTotals(_segments: StageSegment[]): Record<SleepStage, number> {
  throw new NotImplementedError('stageTotals');
}
