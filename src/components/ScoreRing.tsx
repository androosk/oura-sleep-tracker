import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

/**
 * The large circular sleep-score gauge (US-005).
 *
 * Contract (src/__tests__/components/ScoreRing.test.tsx):
 * - Shows the score as text, centered in the ring; null score renders '—'.
 * - Exposes testID 'score-ring' plus 'score-ring-<category>' where category
 *   comes from scoreCategory(), so color banding is assertable.
 */

export interface ScoreRingProps {
  score: number | null;
}

export function ScoreRing(_props: ScoreRingProps): ReactElement {
  throw new NotImplementedError('ScoreRing');
}
