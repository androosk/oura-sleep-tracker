import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { SleepDocument } from '../api/types';

/**
 * Stage duration totals row (US-006).
 *
 * Contract (src/__tests__/components/StageTotals.test.tsx):
 * - Shows formatted durations for total sleep, deep, REM, light, and awake
 *   time from the document (e.g. '7h 32m', '1h 30m', '1h 45m', '4h 17m', '10m').
 * - Null durations render '—'.
 */

export interface StageTotalsProps {
  night: SleepDocument;
}

export function StageTotals(_props: StageTotalsProps): ReactElement {
  throw new NotImplementedError('StageTotals');
}
