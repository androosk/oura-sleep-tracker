import { OuraParseError } from '../api/errors';
import { parseDailySleepResponse, parseSleepResponse } from '../api/schemas';

import dailyRealistic from './fixtures/daily_sleep.realistic.json';
import dailySandbox from './fixtures/daily_sleep.sandbox.json';
import sleepRealistic from './fixtures/sleep.realistic.json';
import sleepSandbox from './fixtures/sleep.sandbox.json';

describe('parseDailySleepResponse (US-004)', () => {
  it('parses a realistic daily_sleep response', () => {
    const result = parseDailySleepResponse(dailyRealistic);
    expect(result.next_token).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].day).toBe('2026-07-03');
    expect(result.data[0].score).toBe(82);
    expect(result.data[0].contributors.deep_sleep).toBe(88);
  });

  it('parses a recorded sandbox response', () => {
    const result = parseDailySleepResponse(dailySandbox);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('tolerates and strips unknown future fields', () => {
    const withExtra = {
      ...dailyRealistic,
      data: [{ ...dailyRealistic.data[0], some_future_field: 42 }],
    };
    const result = parseDailySleepResponse(withExtra);
    expect(result.data[0]).not.toHaveProperty('some_future_field');
  });

  it.each([[null], [{ data: 'not-an-array' }]])(
    'throws OuraParseError on a malformed envelope %#',
    (input) => {
      expect(() => parseDailySleepResponse(input)).toThrow(OuraParseError);
    },
  );

  // Gate fix: one malformed document must not destroy the whole window —
  // invalid documents are dropped, valid ones survive.
  it('drops a malformed document and keeps the valid ones', () => {
    const mixed = { data: [{ id: 5 }, dailyRealistic.data[0]], next_token: null };
    const result = parseDailySleepResponse(mixed);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].day).toBe('2026-07-03');
  });

  it('tolerates an absent next_token (defaults to null)', () => {
    expect(parseDailySleepResponse({ data: [] }).next_token).toBeNull();
  });
});

describe('parseSleepResponse (US-004)', () => {
  it('parses a realistic sleep response including samples and phases', () => {
    const result = parseSleepResponse(sleepRealistic);
    expect(result.data).toHaveLength(2);
    const night = result.data[0];
    expect(night.type).toBe('long_sleep');
    expect(night.bedtime_start).toBe('2026-07-02T23:41:00-07:00');
    expect(night.sleep_phase_5_min).toHaveLength(92);
    expect(night.heart_rate?.items).toHaveLength(92);
    expect(night.heart_rate?.interval).toBe(300);
    expect(night.total_sleep_duration).toBe(27120);
  });

  it('keeps naps distinguishable via type (US-004 / non-goal: naps hidden, not lost)', () => {
    const result = parseSleepResponse(sleepRealistic);
    expect(result.data.map((d) => d.type)).toEqual(['long_sleep', 'late_nap']);
  });

  it('parses a recorded sandbox response', () => {
    const result = parseSleepResponse(sleepSandbox);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('drops a structurally broken document and keeps the valid ones', () => {
    const mixed = { data: [{ id: 'x' }, sleepRealistic.data[0]], next_token: null };
    const result = parseSleepResponse(mixed);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].type).toBe('long_sleep');
  });
});
