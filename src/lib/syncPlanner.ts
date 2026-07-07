import type { DateRange, IsoDate } from '../api/types';

/**
 * Decides which date windows to fetch (FR-11: last 90 days up front, older
 * history lazily backfilled as the user scrolls). Date math runs in UTC so
 * DST transitions can never shift a calendar day.
 */

const DAY_MS = 86_400_000;

function toUtcMs(day: IsoDate): number {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, dayOfMonth);
}

function toIsoDate(utcMs: number): IsoDate {
  return new Date(utcMs).toISOString().slice(0, 10);
}

/** Calendar-day arithmetic in UTC (immune to DST). */
export function addDays(day: IsoDate, delta: number): IsoDate {
  return toIsoDate(toUtcMs(day) + delta * DAY_MS);
}

/** A 90-day inclusive window ending today. */
export function initialSyncRange(today: IsoDate): DateRange {
  return { start: toIsoDate(toUtcMs(today) - 89 * DAY_MS), end: today };
}

/** The adjacent 90-day inclusive window before the oldest synced day. */
export function nextBackfillRange(oldestSyncedDay: IsoDate): DateRange {
  const oldest = toUtcMs(oldestSyncedDay);
  return { start: toIsoDate(oldest - 90 * DAY_MS), end: toIsoDate(oldest - DAY_MS) };
}
