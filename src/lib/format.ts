import type { IsoDate, LocalizedTimestamp } from '../api/types';

/**
 * Display formatting. All functions are pure; timezone comes from the device
 * (fixed to America/Chicago in jest.config.js so tests are deterministic).
 */

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatClockTime(timestamp: LocalizedTimestamp): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

/** Today as a calendar date in the device's local timezone. */
export function localToday(): IsoDate {
  // en-CA formats as YYYY-MM-DD; toISOString would give the UTC date, which
  // is tomorrow during a Chicago evening.
  return new Date().toLocaleDateString('en-CA');
}

export function formatDayLabel(day: IsoDate): string {
  // Construct from components so the calendar date is never shifted by
  // timezone math (parsing '2026-07-03' as a Date would read it as UTC).
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return new Date(year, month - 1, dayOfMonth).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
