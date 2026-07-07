import { averageDurationSeconds, averageScore } from '../lib/stats';

import type { TrendPoint } from '../lib/stats';

const point = (
  day: string,
  score: number | null,
  totalSleepSeconds: number | null,
): TrendPoint => ({
  day,
  score,
  totalSleepSeconds,
});

describe('trend averages (US-010)', () => {
  it('averages scores ignoring null nights', () => {
    expect(
      averageScore([
        point('2026-07-01', 80, null),
        point('2026-07-02', 82, null),
        point('2026-07-03', null, null),
        point('2026-07-04', 78, null),
      ]),
    ).toBe(80);
  });

  it('rounds the score average to the nearest integer', () => {
    expect(averageScore([point('2026-07-01', 80, null), point('2026-07-02', 81, null)])).toBe(81);
  });

  it('returns null when there is nothing to average', () => {
    expect(averageScore([])).toBeNull();
    expect(averageScore([point('2026-07-01', null, null)])).toBeNull();
  });

  it('averages durations ignoring null nights', () => {
    expect(
      averageDurationSeconds([
        point('2026-07-01', null, 27120),
        point('2026-07-02', null, null),
        point('2026-07-03', null, 25200),
      ]),
    ).toBe(26160);
  });
});
