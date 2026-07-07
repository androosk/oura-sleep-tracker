import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { localToday } from '../lib/format';
import { initialSyncRange, nextBackfillRange } from '../lib/syncPlanner';

import type { OuraClient } from '../api/client';
import type { DailySleepDocument, IsoDate, SleepDocument } from '../api/types';
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
  latestNight?: SleepDocument;
  historyEntries: HistoryEntry[];
  trendPoints: TrendPoint[];
  nightByDay(day: IsoDate): { daily?: DailySleepDocument; night?: SleepDocument };
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
    // Naps and rests stay out of the UI (non-goal) but remain in the cache.
    const nightDocs = (sleepQuery.data ?? []).filter((doc) => doc.type === 'long_sleep');

    const dailyByDay = new Map(dailyDocs.map((doc) => [doc.day, doc]));
    const nightByDayMap = new Map(nightDocs.map((doc) => [doc.day, doc]));
    const days = [...new Set([...dailyByDay.keys(), ...nightByDayMap.keys()])].sort();
    const latestDay = days[days.length - 1];

    const isLoading = dailyQuery.isPending || sleepQuery.isPending;
    let homeStatus: HomeStatus;
    if (isLoading) homeStatus = 'loading';
    else if (days.length === 0) homeStatus = 'empty-window';
    else if (!nightByDayMap.get(latestDay)) homeStatus = 'no-data-last-night';
    else homeStatus = 'ready';

    return {
      homeStatus,
      latestDaily: latestDay ? dailyByDay.get(latestDay) : undefined,
      latestNight: latestDay ? nightByDayMap.get(latestDay) : undefined,
      historyEntries: days.map((day) => ({
        day,
        score: dailyByDay.get(day)?.score ?? null,
        totalSleepSeconds: nightByDayMap.get(day)?.total_sleep_duration ?? null,
      })),
      trendPoints: days.map((day) => ({
        day,
        score: dailyByDay.get(day)?.score ?? null,
        totalSleepSeconds: nightByDayMap.get(day)?.total_sleep_duration ?? null,
      })),
      nightByDay: (day) => ({ daily: dailyByDay.get(day), night: nightByDayMap.get(day) }),
      loadOlder: () => setOldestDay((current) => nextBackfillRange(current).start),
      isStale:
        (dailyQuery.isError || sleepQuery.isError) &&
        (dailyDocs.length > 0 || nightDocs.length > 0),
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
