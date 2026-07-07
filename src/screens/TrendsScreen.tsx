import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { TrendPoint } from '../lib/stats';

/**
 * Trends over time (US-010).
 *
 * Contract (src/__tests__/screens/TrendsScreen.test.tsx):
 * - Renders period selector buttons with testIDs 'period-2w', 'period-1m',
 *   'period-3m'; pressing one calls onPeriodChange with that period.
 * - Shows averageScore(points) as plain text (testID 'trend-average-score')
 *   and the average duration formatted (testID 'trend-average-duration').
 * - Charts for score and duration are data-only: no commentary strings.
 */

export type TrendPeriod = '2w' | '1m' | '3m';

export interface TrendsScreenProps {
  points: TrendPoint[];
  period: TrendPeriod;
  onPeriodChange(period: TrendPeriod): void;
}

export function TrendsScreen(_props: TrendsScreenProps): ReactElement {
  throw new NotImplementedError('TrendsScreen');
}
