import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { SleepContributors } from '../api/types';

/**
 * The six score contributors with value bars, like the Oura sleep tab (US-005).
 *
 * Contract (src/__tests__/components/ContributorList.test.tsx):
 * - Renders one row per contributor (testID 'contributor-row'), six total:
 *   Deep sleep, Efficiency, Latency, REM sleep, Restfulness, Timing.
 *   ('total_sleep' is shown as Total sleep too — seven rows — matching Oura.)
 * - Each row shows its label and numeric value; null values render '—'.
 */

export interface ContributorListProps {
  contributors: SleepContributors;
}

export function ContributorList(_props: ContributorListProps): ReactElement {
  throw new NotImplementedError('ContributorList');
}
