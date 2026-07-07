import { NotImplementedError } from './notImplemented';

/**
 * Oura's score banding, used purely as a data color — never as judgmental copy.
 *
 * Contract (src/__tests__/scoreColor.test.ts):
 * - 85..100 -> 'optimal', 70..84 -> 'good', 0..69 -> 'attention', null -> 'none'.
 */

export type ScoreCategory = 'optimal' | 'good' | 'attention' | 'none';

export function scoreCategory(_score: number | null): ScoreCategory {
  throw new NotImplementedError('scoreCategory');
}
