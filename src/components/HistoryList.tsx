import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { IsoDate } from '../api/types';

/**
 * Scrollable list of past nights (US-009).
 *
 * Contract (src/__tests__/components/HistoryList.test.tsx):
 * - One row per night with data, testID 'history-row-<day>', ordered most
 *   recent first regardless of input order.
 * - Each row shows formatDayLabel(day), the score, and formatted duration.
 * - Pressing a row calls onSelectNight(day).
 * - Empty input renders strings.history.empty and no rows.
 * - onEndReached triggers onLoadOlder (lazy backfill, FR-11).
 */

export interface HistoryEntry {
  day: IsoDate;
  score: number | null;
  totalSleepSeconds: number | null;
}

export interface HistoryListProps {
  nights: HistoryEntry[];
  onSelectNight(day: IsoDate): void;
  onLoadOlder(): void;
}

export function HistoryList(_props: HistoryListProps): ReactElement {
  throw new NotImplementedError('HistoryList');
}
