import { buildCompositeNight } from '../lib/composite';
import { parseSleepPhases } from '../lib/phases';

import sleepRealistic from './fixtures/sleep.realistic.json';

import type { SleepDocument } from '../api/types';

/**
 * US-015: a fragmented night (multiple 'sleep'-type docs) stitches into one
 * composite night. Fixture: fragment A sleeps 23:00–23:10 (awake, light),
 * a 30-minute gap, fragment B sleeps 23:40–23:50 (deep, REM).
 */

const base = sleepRealistic.data[0] as unknown as SleepDocument;

function fragment(overrides: Partial<SleepDocument>): SleepDocument {
  return { ...base, heart_rate: null, hrv: null, ...overrides };
}

const fragmentA = fragment({
  id: 'frag-a',
  day: '2026-07-07',
  bedtime_start: '2026-07-06T23:00:00-05:00',
  bedtime_end: '2026-07-06T23:10:00-05:00',
  type: 'sleep',
  sleep_phase_5_min: '42',
  total_sleep_duration: 300,
  awake_time: 300,
  light_sleep_duration: 300,
  deep_sleep_duration: 0,
  rem_sleep_duration: 0,
  time_in_bed: 600,
  latency: 60,
  efficiency: 50,
  lowest_heart_rate: 55,
  average_heart_rate: 60,
  average_hrv: null,
  heart_rate: { interval: 300, items: [60, 62], timestamp: '2026-07-06T23:00:00-05:00' },
});

const fragmentB = fragment({
  id: 'frag-b',
  day: '2026-07-07',
  bedtime_start: '2026-07-06T23:40:00-05:00',
  bedtime_end: '2026-07-06T23:50:00-05:00',
  type: 'sleep',
  sleep_phase_5_min: '13',
  total_sleep_duration: 600,
  awake_time: 0,
  light_sleep_duration: 0,
  deep_sleep_duration: 300,
  rem_sleep_duration: 300,
  time_in_bed: 600,
  latency: 30,
  efficiency: 100,
  lowest_heart_rate: 50,
  average_heart_rate: 70,
  average_hrv: 70,
  heart_rate: { interval: 300, items: [70, null], timestamp: '2026-07-06T23:40:00-05:00' },
});

describe('buildCompositeNight (US-015: fragmented nights become one view)', () => {
  const composite = () => buildCompositeNight([fragmentA, fragmentB])!;

  it('spans first bedtime to last wake', () => {
    expect(composite().bedtimeStart).toBe('2026-07-06T23:00:00-05:00');
    expect(composite().bedtimeEnd).toBe('2026-07-06T23:50:00-05:00');
    expect(composite().timeInBedSeconds).toBe(3000);
  });

  it('places fragment stages at true offsets with the gap as awake', () => {
    expect(composite().segments).toEqual([
      { stage: 'awake', startOffsetSeconds: 0, durationSeconds: 300 },
      { stage: 'light', startOffsetSeconds: 300, durationSeconds: 300 },
      { stage: 'awake', startOffsetSeconds: 600, durationSeconds: 1800 },
      { stage: 'deep', startOffsetSeconds: 2400, durationSeconds: 300 },
      { stage: 'rem', startOffsetSeconds: 2700, durationSeconds: 300 },
    ]);
  });

  it('merges the gap with an adjacent awake stage', () => {
    const endsAwake = { ...fragmentA, sleep_phase_5_min: '24' };
    const merged = buildCompositeNight([endsAwake, fragmentB])!;
    expect(merged.segments).toEqual([
      { stage: 'light', startOffsetSeconds: 0, durationSeconds: 300 },
      { stage: 'awake', startOffsetSeconds: 300, durationSeconds: 2100 },
      { stage: 'deep', startOffsetSeconds: 2400, durationSeconds: 300 },
      { stage: 'rem', startOffsetSeconds: 2700, durationSeconds: 300 },
    ]);
  });

  it('sums stage totals across fragments (gaps count only visually, not in totals)', () => {
    expect(composite().totals).toEqual({
      asleep: 900,
      deep: 300,
      rem: 300,
      light: 300,
      awake: 300,
    });
  });

  it('recomputes efficiency over the span and takes latency from the first fragment', () => {
    expect(composite().efficiencyPercent).toBe(30); // 900 / 3000
    expect(composite().latencySeconds).toBe(60);
  });

  it('aggregates vitals: min lowest HR, duration-weighted averages, nulls excluded', () => {
    expect(composite().lowestHeartRate).toBe(50);
    expect(composite().averageHeartRate).toBeCloseTo(66.67, 1); // (60·300 + 70·600) / 900
    expect(composite().averageHrv).toBe(70); // fragment A has null HRV
  });

  it('plots samples at composite offsets and never bridges gaps', () => {
    expect(composite().heartRateRuns).toEqual([
      [
        { offsetSeconds: 0, value: 60 },
        { offsetSeconds: 300, value: 62 },
      ],
      [{ offsetSeconds: 2400, value: 70 }],
    ]);
  });

  it('handles fragments with differing UTC offsets via epoch math', () => {
    const bInParis = { ...fragmentB, bedtime_start: '2026-07-07T05:40:00+01:00' };
    const mixed = buildCompositeNight([fragmentA, bInParis])!;
    expect(mixed.segments[2]).toEqual({
      stage: 'awake',
      startOffsetSeconds: 600,
      durationSeconds: 1800,
    });
  });

  it('renders a phase-less fragment as one unknown segment', () => {
    const mute = { ...fragmentB, sleep_phase_5_min: null };
    const segments = buildCompositeNight([fragmentA, mute])!.segments;
    expect(segments[segments.length - 1]).toEqual({
      stage: 'unknown',
      startOffsetSeconds: 2400,
      durationSeconds: 600,
    });
  });

  it('accepts fragments in any order', () => {
    expect(buildCompositeNight([fragmentB, fragmentA])).toEqual(composite());
  });

  it('is equivalent to the fragment for a single-session night (regression)', () => {
    const single = buildCompositeNight([base])!;
    expect(single.bedtimeStart).toBe(base.bedtime_start);
    expect(single.bedtimeEnd).toBe(base.bedtime_end);
    expect(single.segments).toEqual(parseSleepPhases(base.sleep_phase_5_min!));
    expect(single.totals.asleep).toBe(base.total_sleep_duration);
    expect(single.efficiencyPercent).toBe(98); // 27120 / 27720 rounds to the doc's own 98
    expect(single.latencySeconds).toBe(base.latency);
    expect(single.lowestHeartRate).toBe(48);
    expect(single.averageHeartRate).toBe(54.5);
    expect(single.averageHrv).toBe(62);
    expect(single.heartRateRuns.flat().length).toBeGreaterThan(0);
  });

  it('returns null for no sessions', () => {
    expect(buildCompositeNight([])).toBeNull();
  });
});
