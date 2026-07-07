import { scoreCategory } from '../lib/scoreColor';

describe('scoreCategory (US-005: Oura score banding)', () => {
  it.each([
    [100, 'optimal'],
    [85, 'optimal'],
    [84, 'good'],
    [70, 'good'],
    [69, 'attention'],
    [0, 'attention'],
    [null, 'none'],
  ] as const)('maps %p to %s', (score, expected) => {
    expect(scoreCategory(score)).toBe(expected);
  });
});
