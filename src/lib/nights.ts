import type { IsoDate, SleepDocument } from '../api/types';

/**
 * Decides which sleep sessions count as "the night" for a day.
 *
 * Oura's type semantics (API spec): 'long_sleep' is sleep over 3 hours;
 * 'sleep' is confirmed sleep of 15 min–3 h that STILL contributes to the
 * daily score — a short or fragmented night arrives as one or more 'sleep'
 * documents with no 'long_sleep' at all. 'late_nap' and 'rest' do not
 * describe the night and are excluded.
 *
 * Contract (src/__tests__/nights.test.ts):
 * - Contributing types are 'long_sleep' and 'sleep'; everything else is
 *   ignored (a day with only naps has no entry).
 * - primary = the longest contributing session of the day (Oura's 3-hour
 *   boundary means a real long_sleep always outranks fragments and naps).
 * - totalSleepSeconds = the sum across the day's contributing sessions —
 *   matching the daily total Oura shows — or null when none report one.
 */

const CONTRIBUTING_TYPES: ReadonlySet<SleepDocument['type']> = new Set(['long_sleep', 'sleep']);

export interface DayNights {
  /** The session rendered as the night's detail (hypnogram, vitals, timing). */
  primary: SleepDocument;
  /** Day total across contributing sessions, as shown in history and trends. */
  totalSleepSeconds: number | null;
}

function sessionLength(doc: SleepDocument): number {
  return doc.total_sleep_duration ?? doc.time_in_bed;
}

export function groupNightsByDay(docs: SleepDocument[]): Map<IsoDate, DayNights> {
  const byDay = new Map<IsoDate, DayNights>();
  for (const doc of docs) {
    if (!CONTRIBUTING_TYPES.has(doc.type)) continue;
    const existing = byDay.get(doc.day);
    const durations = [existing?.totalSleepSeconds, doc.total_sleep_duration].filter(
      (value): value is number => value !== null && value !== undefined,
    );
    const totalSleepSeconds =
      durations.length > 0 ? durations.reduce((sum, value) => sum + value, 0) : null;
    byDay.set(doc.day, {
      primary:
        existing && sessionLength(existing.primary) >= sessionLength(doc) ? existing.primary : doc,
      totalSleepSeconds,
    });
  }
  return byDay;
}
