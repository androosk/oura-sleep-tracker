import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { buildCompositeNight } from '../lib/composite';
import { localToday } from '../lib/format';
import { groupNightsByDay } from '../lib/nights';
import { initialSyncRange, nextBackfillRange } from '../lib/syncPlanner';

import type { OuraClient } from '../api/client';
import type { DailySleepDocument, IsoDate } from '../api/types';
import type { CompositeNight } from '../lib/composite';
import type { HistoryEntry } from '../components/HistoryList';
import type { TrendPoint } from '../lib/stats';
import type { HomeStatus } from '../screens/HomeScreen';

/**
 * All sleep data the UI needs, derived from two queries over one date range.
 * The range starts as the last 90 days (FR-11) and grows backward when the
 * history list hits its end. TanStack Query caches by range key and its
 * persisted cache makes the same data available offline (US-012).
 */

export interface SleepData {
  homeStatus: HomeStatus;
  latestDaily?: DailySleepDocument;
  latestComposite?: CompositeNight;
  historyEntries: HistoryEntry[];
  trendPoints: TrendPoint[];
  nightByDay(day: IsoDate): { daily?: DailySleepDocument; composite?: CompositeNight };
  loadOlder(): void;
  isStale: boolean;
}

export function useSleepData(client: OuraClient): SleepData {
  const today = localToday();
  const [oldestDay, setOldestDay] = useState<IsoDate>(() => initialSyncRange(today).start);
  const range = { start: oldestDay, end: today };

  const dailyQuery = useQuery({
    queryKey: ['daily_sleep', range.start, range.end],
    queryFn: () => client.fetchDailySleep(range),
  });
  const sleepQuery = useQuery({
    queryKey: ['sleep', range.start, range.end],
    queryFn: () => client.fetchSleepSessions(range),
  });

  return useMemo(() => {
    const dailyDocs = dailyQuery.data ?? [];
    // Which sessions count as "the night" — including short/fragmented
    // 'sleep'-type nights, excluding naps and rests — is decided in
    // src/lib/nights.ts. Excluded sessions remain in the cache.
    const nightsByDay = groupNightsByDay(sleepQuery.data ?? []);

    const dailyByDay = new Map(dailyDocs.map((doc) => [doc.day, doc]));
    const days = [...new Set([...dailyByDay.keys(), ...nightsByDay.keys()])].sort();
    const latestDay = days[days.length - 1];

    const isLoading = dailyQuery.isPending || sleepQuery.isPending;
    let homeStatus: HomeStatus;
    if (isLoading) homeStatus = 'loading';
    else if (days.length === 0) homeStatus = 'empty-window';
    else if (!nightsByDay.get(latestDay)) homeStatus = 'no-data-last-night';
    else homeStatus = 'ready';

    return {
      homeStatus,
      latestDaily: latestDay ? dailyByDay.get(latestDay) : undefined,
      latestComposite: latestDay
        ? (buildCompositeNight(nightsByDay.get(latestDay)?.sessions ?? []) ?? undefined)
        : undefined,
      historyEntries: days.map((day) => ({
        day,
        score: dailyByDay.get(day)?.score ?? null,
        totalSleepSeconds: nightsByDay.get(day)?.totalSleepSeconds ?? null,
      })),
      trendPoints: days.map((day) => ({
        day,
        score: dailyByDay.get(day)?.score ?? null,
        totalSleepSeconds: nightsByDay.get(day)?.totalSleepSeconds ?? null,
      })),
      nightByDay: (day) => ({
        daily: dailyByDay.get(day),
        composite: buildCompositeNight(nightsByDay.get(day)?.sessions ?? []) ?? undefined,
      }),
      loadOlder: () => setOldestDay((current) => nextBackfillRange(current).start),
      isStale:
        (dailyQuery.isError || sleepQuery.isError) &&
        (dailyDocs.length > 0 || nightsByDay.size > 0),
    };
  }, [
    dailyQuery.data,
    dailyQuery.isPending,
    dailyQuery.isError,
    sleepQuery.data,
    sleepQuery.isPending,
    sleepQuery.isError,
  ]);
}
