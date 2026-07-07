import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { DailySleepDocument, SleepDocument } from '../api/types';

/**
 * The last-night screen (US-005..US-008 composed). Presentational: data
 * arrives via props; fetching is wired up in the app container so the
 * contract tests can drive every state directly.
 *
 * Contract (src/__tests__/screens/HomeScreen.test.tsx):
 * - status 'loading' renders strings.home.loading.
 * - status 'empty-window' (no data in the whole sync window, FR-12) renders
 *   strings.home.emptyWindow.
 * - status 'no-data-last-night' renders strings.home.noDataLastNight.
 * - status 'ready' renders the ScoreRing with the daily score and the night
 *   sections (contributors, hypnogram, vitals, timing).
 */

export type HomeStatus = 'loading' | 'empty-window' | 'no-data-last-night' | 'ready';

export interface HomeScreenProps {
  status: HomeStatus;
  daily?: DailySleepDocument;
  night?: SleepDocument;
}

export function HomeScreen(_props: HomeScreenProps): ReactElement {
  throw new NotImplementedError('HomeScreen');
}
