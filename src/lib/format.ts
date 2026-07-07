import { NotImplementedError } from './notImplemented';

import type { IsoDate, LocalizedTimestamp } from '../api/types';

/**
 * Display formatting. All functions are pure; timezone comes from the device
 * (fixed to America/Chicago in jest.config.js so tests are deterministic).
 *
 * Contract (src/__tests__/format.test.ts):
 * - formatDuration: 27120 -> '7h 32m', 2700 -> '45m', 0 -> '0m'; rounds to
 *   the nearest minute.
 * - formatClockTime: converts the timestamp's own offset to device-local
 *   12-hour time, e.g. '2026-07-02T23:41:00-07:00' -> '1:41 AM' in Chicago.
 * - formatPercent: 98 -> '98%'.
 * - formatDayLabel: treats IsoDate as a calendar date (never shifted by
 *   timezone math), '2026-07-03' -> 'Fri, Jul 3'.
 */

export function formatDuration(seconds: number): string {
  throw new NotImplementedError(`formatDuration(${seconds})`);
}

export function formatClockTime(_timestamp: LocalizedTimestamp): string {
  throw new NotImplementedError('formatClockTime');
}

export function formatPercent(_value: number): string {
  throw new NotImplementedError('formatPercent');
}

export function formatDayLabel(_day: IsoDate): string {
  throw new NotImplementedError('formatDayLabel');
}
