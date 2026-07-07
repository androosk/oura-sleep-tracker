import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClockTime, formatDuration, formatPercent } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

import type { SleepDocument } from '../api/types';

/**
 * Timing & efficiency facts for a night (US-008). All times render in the
 * device's local timezone via formatClockTime.
 */

export interface TimingSectionProps {
  night: SleepDocument;
}

export function TimingSection({ night }: TimingSectionProps): ReactElement {
  const theme = useTheme();
  const rows: [string, string][] = [
    ['Bedtime', formatClockTime(night.bedtime_start)],
    ['Wake time', formatClockTime(night.bedtime_end)],
    ['Time in bed', formatDuration(night.time_in_bed)],
    [
      'Time asleep',
      night.total_sleep_duration === null ? '—' : formatDuration(night.total_sleep_duration),
    ],
    ['Efficiency', night.efficiency === null ? '—' : formatPercent(night.efficiency)],
    ['Latency', night.latency === null ? '—' : formatDuration(night.latency)],
  ];

  return (
    <View>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
          <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
});
