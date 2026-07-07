import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

import type { SleepContributors } from '../api/types';

/**
 * The seven score contributors with value bars, like the Oura sleep tab
 * (US-005). Contributor values are 0–100.
 */

export interface ContributorListProps {
  contributors: SleepContributors;
}

const CONTRIBUTOR_LABELS: [keyof SleepContributors, string][] = [
  ['deep_sleep', 'Deep sleep'],
  ['efficiency', 'Efficiency'],
  ['latency', 'Latency'],
  ['rem_sleep', 'REM sleep'],
  ['restfulness', 'Restfulness'],
  ['timing', 'Timing'],
  ['total_sleep', 'Total sleep'],
];

export function ContributorList({ contributors }: ContributorListProps): ReactElement {
  const theme = useTheme();
  return (
    <View>
      {CONTRIBUTOR_LABELS.map(([key, label]) => {
        const value = contributors[key];
        return (
          <View key={key} testID="contributor-row" style={styles.row}>
            <View style={styles.labels}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
              <Text style={[styles.value, { color: theme.textSecondary }]}>{value ?? '—'}</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.divider }]}>
              <View
                style={[styles.barFill, { backgroundColor: theme.accent, width: `${value ?? 0}%` }]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 8,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    borderRadius: 1.5,
  },
});
