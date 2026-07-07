import { z } from 'zod';

import { OuraParseError } from './errors';

import type { DailySleepDocument, Paginated, SleepDocument } from './types';

/**
 * Boundary validation: every byte that comes from the Oura API passes
 * through these parsers before the rest of the app sees it. Unknown extra
 * fields are stripped (z.object default); structurally broken input throws
 * OuraParseError. Fields the API marks optional parse to null.
 */

/** Optional-and-nullable on the wire, always `T | null` in the app. */
const nullable = <T extends z.ZodType>(schema: T) => schema.nullable().default(null);

const contributorsSchema = z.object({
  deep_sleep: nullable(z.number()),
  efficiency: nullable(z.number()),
  latency: nullable(z.number()),
  rem_sleep: nullable(z.number()),
  restfulness: nullable(z.number()),
  timing: nullable(z.number()),
  total_sleep: nullable(z.number()),
});

const dailySleepSchema = z.object({
  id: z.string(),
  day: z.string(),
  score: nullable(z.number()),
  contributors: contributorsSchema,
  timestamp: z.string(),
});

const sampleSeriesSchema = z.object({
  interval: z.number(),
  items: z.array(z.number().nullable()),
  timestamp: z.string(),
});

const sleepSchema = z.object({
  id: z.string(),
  day: z.string(),
  bedtime_start: z.string(),
  bedtime_end: z.string(),
  type: nullable(z.enum(['deleted', 'sleep', 'long_sleep', 'late_nap', 'rest'])),
  average_breath: nullable(z.number()),
  average_heart_rate: nullable(z.number()),
  average_hrv: nullable(z.number()),
  awake_time: nullable(z.number()),
  deep_sleep_duration: nullable(z.number()),
  efficiency: nullable(z.number()),
  heart_rate: nullable(sampleSeriesSchema),
  hrv: nullable(sampleSeriesSchema),
  latency: nullable(z.number()),
  light_sleep_duration: nullable(z.number()),
  low_battery_alert: z.boolean(),
  lowest_heart_rate: nullable(z.number()),
  period: z.number(),
  rem_sleep_duration: nullable(z.number()),
  restless_periods: nullable(z.number()),
  sleep_phase_5_min: nullable(z.string()),
  time_in_bed: z.number(),
  total_sleep_duration: nullable(z.number()),
});

const paginated = <T extends z.ZodType>(documentSchema: T) =>
  z.object({
    data: z.array(documentSchema),
    next_token: z.string().nullable(),
  });

function parseOrThrow<T>(schema: z.ZodType<T>, json: unknown): T {
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new OuraParseError(
      `The Oura API returned data in an unexpected shape: ${result.error.issues[0]?.path.join('.')}`,
    );
  }
  return result.data;
}

export function parseDailySleepResponse(json: unknown): Paginated<DailySleepDocument> {
  return parseOrThrow(paginated(dailySleepSchema), json);
}

export function parseSleepResponse(json: unknown): Paginated<SleepDocument> {
  return parseOrThrow(paginated(sleepSchema), json);
}
