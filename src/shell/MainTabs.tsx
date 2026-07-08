import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HistoryList } from '../components/HistoryList';
import { strings } from '../copy/strings';
import { formatDayLabel, localToday } from '../lib/format';
import { HomeScreen } from '../screens/HomeScreen';
import { TrendsScreen } from '../screens/TrendsScreen';
import { useTheme } from '../theme/ThemeProvider';

import type { OuraClient } from '../api/client';
import type { IsoDate } from '../api/types';
import type { TrendPeriod } from '../screens/TrendsScreen';
import { useSleepData } from './useSleepData';

/**
 * Tab shell: Sleep (last night), History, Trends. A tapped history row opens
 * that night's detail (the HomeScreen layout for that day) with a back
 * action. Navigation is plain component state — three screens don't justify
 * a navigation library in a codebase meant to be read end-to-end.
 */

type Tab = 'sleep' | 'history' | 'trends';

const TABS: [Tab, string][] = [
  ['sleep', 'Sleep'],
  ['history', strings.history.title],
  ['trends', strings.trends.title],
];

const PERIOD_DAYS: Record<TrendPeriod, number> = { '2w': 14, '1m': 30, '3m': 90 };

function daysAgo(days: number): IsoDate {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString('en-CA');
}

export function MainTabs({ client }: { client: OuraClient }): ReactElement {
  const theme = useTheme();
  const data = useSleepData(client);
  const [tab, setTab] = useState<Tab>('sleep');
  const [selectedDay, setSelectedDay] = useState<IsoDate | null>(null);
  const [period, setPeriod] = useState<TrendPeriod>('2w');

  const today = localToday();

  let body: ReactElement;
  if (selectedDay) {
    const { daily, composite } = data.nightByDay(selectedDay);
    body = (
      <View style={styles.body}>
        <Pressable onPress={() => setSelectedDay(null)} style={styles.backRow}>
          <Text style={{ color: theme.accent }}>‹ {strings.history.title}</Text>
          <Text style={{ color: theme.textSecondary }}>{formatDayLabel(selectedDay)}</Text>
        </Pressable>
        <HomeScreen
          status={daily || composite ? 'ready' : 'no-data-last-night'}
          daily={daily}
          composite={composite}
        />
      </View>
    );
  } else if (tab === 'sleep') {
    body = (
      <View style={styles.body}>
        {data.latestComposite && data.latestComposite.day !== today && (
          <Text style={[styles.dateNote, { color: theme.textSecondary }]}>
            {formatDayLabel(data.latestComposite.day)}
          </Text>
        )}
        <HomeScreen
          status={data.homeStatus}
          daily={data.latestDaily}
          composite={data.latestComposite}
        />
      </View>
    );
  } else if (tab === 'history') {
    body = (
      <HistoryList
        nights={data.historyEntries}
        onSelectNight={setSelectedDay}
        onLoadOlder={data.loadOlder}
      />
    );
  } else {
    const cutoff = daysAgo(PERIOD_DAYS[period]);
    body = (
      <TrendsScreen
        points={data.trendPoints.filter((point) => point.day >= cutoff)}
        period={period}
        onPeriodChange={setPeriod}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {data.isStale && (
        <Text style={[styles.staleBanner, { color: theme.textSecondary }]}>
          {strings.errors.staleData}
        </Text>
      )}
      <View style={styles.body}>{body}</View>
      <View style={[styles.tabBar, { borderTopColor: theme.divider }]}>
        {TABS.map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => {
              setSelectedDay(null);
              setTab(value);
            }}
            style={styles.tabItem}
          >
            <Text style={{ color: tab === value ? theme.accent : theme.textSecondary }}>
              {label}
            </Text>
            <View
              style={[
                styles.tabIndicator,
                { backgroundColor: tab === value ? theme.accent : 'transparent' },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dateNote: {
    textAlign: 'center',
    paddingBottom: 4,
  },
  staleBanner: {
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 28,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  tabIndicator: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
});
