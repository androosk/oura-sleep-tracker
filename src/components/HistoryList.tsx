import { type ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../copy/strings';
import { formatDayLabel, formatDuration } from '../lib/format';
import { scoreCategory } from '../lib/scoreColor';
import { useTheme } from '../theme/ThemeProvider';

import type { IsoDate } from '../api/types';

/**
 * Scrollable list of past nights (US-009), most recent first. Reaching the
 * end asks the container for older data (lazy backfill, FR-11). An empty
 * list renders the factual empty state (FR-12).
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

export function HistoryList({
  nights,
  onSelectNight,
  onLoadOlder,
}: HistoryListProps): ReactElement {
  const theme = useTheme();
  const sorted = [...nights].sort((a, b) => (a.day < b.day ? 1 : -1));
  const scoreColor = {
    optimal: theme.scoreOptimal,
    good: theme.scoreGood,
    attention: theme.scoreAttention,
    none: theme.scoreNone,
  };

  return (
    <FlatList
      testID="history-list"
      data={sorted}
      keyExtractor={(entry) => entry.day}
      onEndReached={onLoadOlder}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View testID="history-empty" style={styles.empty}>
          <Text style={{ color: theme.textSecondary }}>{strings.history.empty}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          testID={`history-row-${item.day}`}
          onPress={() => onSelectNight(item.day)}
          style={[styles.row, { borderBottomColor: theme.divider }]}
        >
          <Text style={[styles.day, { color: theme.textPrimary }]}>{formatDayLabel(item.day)}</Text>
          <View style={styles.metrics}>
            <View
              style={[styles.scoreDot, { backgroundColor: scoreColor[scoreCategory(item.score)] }]}
            />
            <Text style={[styles.score, { color: theme.textPrimary }]}>{item.score ?? '—'}</Text>
            <Text style={[styles.duration, { color: theme.textSecondary }]}>
              {item.totalSleepSeconds === null ? '—' : formatDuration(item.totalSleepSeconds)}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  day: {
    fontSize: 15,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  score: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    minWidth: 28,
    textAlign: 'right',
  },
  duration: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    minWidth: 64,
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
});
