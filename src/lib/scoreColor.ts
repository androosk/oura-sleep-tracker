/**
 * Oura's score banding, used purely as a data color — never as judgmental copy.
 */

export type ScoreCategory = 'optimal' | 'good' | 'attention' | 'none';

export function scoreCategory(score: number | null): ScoreCategory {
  if (score === null) return 'none';
  if (score >= 85) return 'optimal';
  if (score >= 70) return 'good';
  return 'attention';
}
