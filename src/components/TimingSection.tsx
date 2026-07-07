import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { SleepDocument } from '../api/types';

/**
 * Timing & efficiency facts for a night (US-008).
 *
 * Contract (src/__tests__/components/TimingSection.test.tsx):
 * - Shows bedtime and wake time in device-local time (formatClockTime),
 *   time in bed, time asleep, efficiency ('98%'), and latency ('9m').
 */

export interface TimingSectionProps {
  night: SleepDocument;
}

export function TimingSection(_props: TimingSectionProps): ReactElement {
  throw new NotImplementedError('TimingSection');
}
