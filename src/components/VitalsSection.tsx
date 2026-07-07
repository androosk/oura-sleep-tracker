import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { SleepDocument } from '../api/types';

/**
 * Overnight heart rate & HRV charts with summary values (US-007).
 *
 * Contract (src/__tests__/components/VitalsSection.test.tsx):
 * - Shows lowest HR ('48 bpm'), average HR rounded ('55 bpm'), and average
 *   HRV ('62 ms') from the document.
 * - Charts are built from splitSeriesAtGaps so null samples appear as gaps.
 * - A night with heart_rate/hrv null shows the summary values that exist and
 *   omits the charts without erroring.
 */

export interface VitalsSectionProps {
  night: SleepDocument;
}

export function VitalsSection(_props: VitalsSectionProps): ReactElement {
  throw new NotImplementedError('VitalsSection');
}
