import { type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { strings } from '../copy/strings';
import { formatDuration } from '../lib/format';
import { averageDurationSeconds, averageScore } from '../lib/stats';
import { useTheme } from '../theme/ThemeProvider';

import type { TrendPoint } from '../lib/stats';

/**
 * Trends over time (US-010). Data only: averages are plain numbers, charts
 * carry no commentary.
 */

export type TrendPeriod = '2w' | '1m' | '3m';

export interface TrendsScreenProps {
  points: TrendPoint[];
  period: TrendPeriod;
  onPeriodChange(period: TrendPeriod): void;
}

const PERIODS: [TrendPeriod, string][] = [
  ['2w', '2 weeks'],
  ['1m', '1 month'],
  ['3m', '3 months'],
];

const BAR_AREA_HEIGHT = 120;

function Bars({ values, max }: { values: (number | null)[]; max: number }): ReactElement {
  const theme = useTheme();
  return (
    <View style={styles.barArea}>
      {values.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: theme.chartLine,
              height: value === null ? 0 : Math.max(2, (value / max) * BAR_AREA_HEIGHT),
            },
          ]}
        />
      ))}
    </View>
  );
}

export function TrendsScreen({ points, period, onPeriodChange }: TrendsScreenProps): ReactElement {
  const theme = useTheme();
  const avgScore = averageScore(points);
  const avgDuration = averageDurationSeconds(points);
  const maxDuration = Math.max(1, ...points.map((point) => point.totalSleepSeconds ?? 0));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.selector, { backgroundColor: theme.surface }]}>
        {PERIODS.map(([value, label]) => (
          <Pressable
            key={value}
            testID={`period-${value}`}
            onPress={() => onPeriodChange(value)}
            style={[styles.selectorItem, period === value && { backgroundColor: theme.divider }]}
          >
            <Text style={{ color: period === value ? theme.textPrimary : theme.textSecondary }}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>
          {strings.trends.averageScoreLabel}
        </Text>
        <View testID="trend-average-score">
          <Text style={[styles.average, { color: theme.textPrimary }]}>{avgScore ?? '—'}</Text>
        </View>
        <Bars values={points.map((point) => point.score)} max={100} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>
          {strings.trends.averageDurationLabel}
        </Text>
        <View testID="trend-average-duration">
          <Text style={[styles.average, { color: theme.textPrimary }]}>
            {avgDuration === null ? '—' : formatDuration(avgDuration)}
          </Text>
        </View>
        <Bars values={points.map((point) => point.totalSleepSeconds)} max={maxDuration} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  selector: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  selectorItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  average: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 12,
  },
  barArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: BAR_AREA_HEIGHT,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
});
