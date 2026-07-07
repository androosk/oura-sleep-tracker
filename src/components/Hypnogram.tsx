import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { LocalizedTimestamp } from '../api/types';
import type { StageSegment } from '../lib/phases';

/**
 * Sleep-stage timeline chart (US-006), drawn with react-native-svg.
 *
 * Contract (src/__tests__/components/Hypnogram.test.tsx):
 * - Renders container testID 'hypnogram' and one 'hypnogram-segment' element
 *   per merged StageSegment.
 * - Axis labels show bedtime and wake time in device-local time via
 *   formatClockTime.
 */

export interface HypnogramProps {
  segments: StageSegment[];
  bedtimeStart: LocalizedTimestamp;
  bedtimeEnd: LocalizedTimestamp;
}

export function Hypnogram(_props: HypnogramProps): ReactElement {
  throw new NotImplementedError('Hypnogram');
}
