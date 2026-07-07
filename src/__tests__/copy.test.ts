import { strings } from '../copy/strings';

/**
 * The deterministic half of FR-7 (no-nanny copy). The judgment half —
 * "is the tone descriptive and factual" — lives in evals/copy-tone.md.
 */

function leaves(node: unknown, path: string): [string, string][] {
  if (typeof node === 'string') return [[path, node]];
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) => leaves(value, `${path}.${key}`));
  }
  return [];
}

const allStrings = leaves(strings, 'strings');

const BANNED_PATTERNS: RegExp[] = [
  /it'?s going to be (ok|okay)/i,
  /don'?t worry/i,
  /great job/i,
  /well done/i,
  /keep it up/i,
  /keep up the/i,
  /you('re| are) doing/i,
  /congrat/i,
  /you('ve| have) got this/i,
  /we (recommend|suggest)/i,
  /try (to|going|getting)/i,
  /consider/i,
  /take it easy/i,
  /listen to your body/i,
];

describe('string catalog (FR-7: descriptive, factual, no nannying)', () => {
  it('has at least the screens covered', () => {
    expect(allStrings.length).toBeGreaterThanOrEqual(15);
  });

  it.each(allStrings)('%s is non-empty', (_path, value) => {
    expect(value.trim().length).toBeGreaterThan(0);
  });

  it.each(allStrings)('%s contains no banned motivational/advisory phrasing', (_path, value) => {
    for (const pattern of BANNED_PATTERNS) {
      expect(value).not.toMatch(pattern);
    }
  });

  it.each(allStrings)('%s contains no exclamation marks', (_path, value) => {
    expect(value).not.toContain('!');
  });

  it.each(allStrings)('%s contains no emoji', (_path, value) => {
    expect(value).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('setup explanation tells the user where to register their OAuth app (US-002)', () => {
    expect(strings.setup.explanation).toContain('cloud.ouraring.com');
  });
});
