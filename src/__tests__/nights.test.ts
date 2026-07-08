import { groupNightsByDay } from '../lib/nights';

import type { SleepDocument, SleepType } from '../api/types';

/**
 * Regression contract for the 2026-07-07 bug: a short or fragmented night
 * arrives from Oura as 'sleep'-type documents (≤3 h each, no 'long_sleep'),
 * still earns a daily score, and must count as the night — while actual
 * naps ('late_nap') and rests stay excluded.
 */

function doc(overrides: {
  id: string;
  day: string;
  type: SleepType | null;
  total?: number | null;
  timeInBed?: number;
}): SleepDocument {
  return {
    id: overrides.id,
    day: overrides.day,
    bedtime_start: `${overrides.day}T00:10:00-05:00`,
    bedtime_end: `${overrides.day}T06:40:00-05:00`,
    type: overrides.type,
    average_breath: null,
    average_heart_rate: null,
    average_hrv: null,
    awake_time: null,
    deep_sleep_duration: null,
    efficiency: null,
    heart_rate: null,
    hrv: null,
    latency: null,
    light_sleep_duration: null,
    low_battery_alert: false,
    lowest_heart_rate: null,
    period: 1,
    rem_sleep_duration: null,
    restless_periods: null,
    sleep_phase_5_min: null,
    time_in_bed: overrides.timeInBed ?? overrides.total ?? 0,
    total_sleep_duration: overrides.total === undefined ? null : overrides.total,
  };
}

describe('groupNightsByDay (short/fragmented nights count; naps do not)', () => {
  it('accepts a sleep-type session as the night when no long_sleep exists', () => {
    const nights = groupNightsByDay([
      doc({ id: 'frag', day: '2026-07-07', type: 'sleep', total: 9000 }),
    ]);
    expect(nights.get('2026-07-07')?.primary.id).toBe('frag');
    expect(nights.get('2026-07-07')?.totalSleepSeconds).toBe(9000);
  });

  it('sums a fragmented night and shows the longest fragment as primary', () => {
    const nights = groupNightsByDay([
      doc({ id: 'short', day: '2026-07-07', type: 'sleep', total: 5400 }),
      doc({ id: 'long', day: '2026-07-07', type: 'sleep', total: 7200 }),
    ]);
    expect(nights.get('2026-07-07')?.primary.id).toBe('long');
    expect(nights.get('2026-07-07')?.totalSleepSeconds).toBe(12600);
  });

  it('retains every contributing session for the composite night (US-015)', () => {
    const nights = groupNightsByDay([
      doc({ id: 'short', day: '2026-07-07', type: 'sleep', total: 5400 }),
      doc({ id: 'nap', day: '2026-07-07', type: 'late_nap', total: 2400 }),
      doc({ id: 'long', day: '2026-07-07', type: 'sleep', total: 7200 }),
    ]);
    expect(nights.get('2026-07-07')?.sessions.map((s) => s.id)).toEqual(['short', 'long']);
  });

  it('keeps long_sleep as primary while counting a same-day nap toward the total', () => {
    const nights = groupNightsByDay([
      doc({ id: 'night', day: '2026-07-06', type: 'long_sleep', total: 27120 }),
      doc({ id: 'nap', day: '2026-07-06', type: 'sleep', total: 2400 }),
    ]);
    expect(nights.get('2026-07-06')?.primary.id).toBe('night');
    expect(nights.get('2026-07-06')?.totalSleepSeconds).toBe(29520);
  });

  it('ignores late_nap, rest, deleted, and untyped sessions entirely', () => {
    const nights = groupNightsByDay([
      doc({ id: 'nap', day: '2026-07-05', type: 'late_nap', total: 2400 }),
      doc({ id: 'rest', day: '2026-07-05', type: 'rest', total: 1800 }),
      doc({ id: 'gone', day: '2026-07-05', type: 'deleted', total: 1200 }),
      doc({ id: 'unknown', day: '2026-07-05', type: null, total: 1200 }),
    ]);
    expect(nights.has('2026-07-05')).toBe(false);
  });

  it('groups by day independently', () => {
    const nights = groupNightsByDay([
      doc({ id: 'a', day: '2026-07-06', type: 'long_sleep', total: 27120 }),
      doc({ id: 'b', day: '2026-07-07', type: 'sleep', total: 9000 }),
    ]);
    expect(nights.size).toBe(2);
  });

  it('falls back to time_in_bed for primary selection and reports null totals', () => {
    const nights = groupNightsByDay([
      doc({ id: 'shorter', day: '2026-07-07', type: 'sleep', total: null, timeInBed: 3600 }),
      doc({ id: 'longer', day: '2026-07-07', type: 'sleep', total: null, timeInBed: 7200 }),
    ]);
    expect(nights.get('2026-07-07')?.primary.id).toBe('longer');
    expect(nights.get('2026-07-07')?.totalSleepSeconds).toBeNull();
  });
});
