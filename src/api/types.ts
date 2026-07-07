/**
 * Data model for the Oura API v2 documents this app consumes.
 * Field names mirror the wire format exactly (snake_case) so the Zod
 * schemas in ./schemas.ts are a 1:1 description of the API boundary.
 */

/** Calendar date, e.g. '2026-07-03'. A date, not a moment in time. */
export type IsoDate = string;

/** ISO 8601 timestamp carrying a UTC offset, e.g. '2026-07-02T23:41:00-07:00'. */
export type LocalizedTimestamp = string;

export interface SleepContributors {
  deep_sleep: number | null;
  efficiency: number | null;
  latency: number | null;
  rem_sleep: number | null;
  restfulness: number | null;
  timing: number | null;
  total_sleep: number | null;
}

/** One document from GET /v2/usercollection/daily_sleep. */
export interface DailySleepDocument {
  id: string;
  day: IsoDate;
  score: number | null;
  contributors: SleepContributors;
  timestamp: LocalizedTimestamp;
}

/** Time series sampled at a fixed interval; null items are gaps (no reading). */
export interface SampleSeries {
  interval: number;
  items: (number | null)[];
  timestamp: LocalizedTimestamp;
}

export type SleepType = 'deleted' | 'sleep' | 'long_sleep' | 'late_nap' | 'rest';

/** One document from GET /v2/usercollection/sleep. Durations are in seconds. */
export interface SleepDocument {
  id: string;
  day: IsoDate;
  bedtime_start: LocalizedTimestamp;
  bedtime_end: LocalizedTimestamp;
  type: SleepType | null;
  average_breath: number | null;
  average_heart_rate: number | null;
  average_hrv: number | null;
  awake_time: number | null;
  deep_sleep_duration: number | null;
  efficiency: number | null;
  heart_rate: SampleSeries | null;
  hrv: SampleSeries | null;
  latency: number | null;
  light_sleep_duration: number | null;
  low_battery_alert: boolean;
  lowest_heart_rate: number | null;
  period: number;
  rem_sleep_duration: number | null;
  restless_periods: number | null;
  /** One char per 5 minutes: '1' deep, '2' light, '3' REM, '4' awake. */
  sleep_phase_5_min: string | null;
  time_in_bed: number;
  total_sleep_duration: number | null;
}

export interface Paginated<T> {
  data: T[];
  next_token: string | null;
}

export interface DateRange {
  start: IsoDate;
  end: IsoDate;
}
