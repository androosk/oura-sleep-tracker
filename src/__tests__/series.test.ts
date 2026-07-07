import { splitSeriesAtGaps } from '../lib/series';

const at = (offsetSeconds: number, value: number) => ({ offsetSeconds, value });

describe('splitSeriesAtGaps (US-007: gaps stay gaps, no interpolation)', () => {
  it('splits runs at null samples', () => {
    expect(
      splitSeriesAtGaps({
        interval: 300,
        items: [60, 62, null, null, 64],
        timestamp: '2026-07-02T23:41:00-07:00',
      }),
    ).toEqual([[at(0, 60), at(300, 62)], [at(1200, 64)]]);
  });

  it('keeps an unbroken series as a single run', () => {
    expect(
      splitSeriesAtGaps({ interval: 300, items: [50, 51], timestamp: '2026-07-02T23:41:00-07:00' }),
    ).toEqual([[at(0, 50), at(300, 51)]]);
  });

  it('yields no runs for an all-null series', () => {
    expect(
      splitSeriesAtGaps({
        interval: 300,
        items: [null, null],
        timestamp: '2026-07-02T23:41:00-07:00',
      }),
    ).toEqual([]);
  });
});
