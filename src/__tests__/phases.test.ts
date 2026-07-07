import { parseSleepPhases, stageTotals } from '../lib/phases';

describe('parseSleepPhases (US-006)', () => {
  it('parses an empty string to no segments', () => {
    expect(parseSleepPhases('')).toEqual([]);
  });

  it('parses a single character to one 5-minute segment', () => {
    expect(parseSleepPhases('4')).toEqual([
      { stage: 'awake', startOffsetSeconds: 0, durationSeconds: 300 },
    ]);
  });

  it('merges consecutive identical stages into single segments', () => {
    expect(parseSleepPhases('44211334')).toEqual([
      { stage: 'awake', startOffsetSeconds: 0, durationSeconds: 600 },
      { stage: 'light', startOffsetSeconds: 600, durationSeconds: 300 },
      { stage: 'deep', startOffsetSeconds: 900, durationSeconds: 600 },
      { stage: 'rem', startOffsetSeconds: 1500, durationSeconds: 600 },
      { stage: 'awake', startOffsetSeconds: 2100, durationSeconds: 300 },
    ]);
  });

  it('treats unrecognized characters as unknown instead of crashing', () => {
    expect(parseSleepPhases('x2')).toEqual([
      { stage: 'unknown', startOffsetSeconds: 0, durationSeconds: 300 },
      { stage: 'light', startOffsetSeconds: 300, durationSeconds: 300 },
    ]);
  });
});

describe('stageTotals (US-006)', () => {
  it('sums durations per stage with 0 for absent stages', () => {
    expect(stageTotals(parseSleepPhases('44211334'))).toEqual({
      awake: 900,
      light: 300,
      deep: 600,
      rem: 600,
      unknown: 0,
    });
  });
});
