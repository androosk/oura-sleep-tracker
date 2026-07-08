import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClockTime, formatDuration, formatPercent } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

import type { CompositeNight } from '../lib/composite';

/**
 * Timing & efficiency facts for a night (US-008, US-015). For a fragmented
 * night these describe the whole span: first bedtime to last wake, summed
 * sleep, efficiency over the span.
 */

export interface TimingSectionProps {
  night: CompositeNight;
}

export function TimingSection({ night }: TimingSectionProps): ReactElement {
  const theme = useTheme();
  const rows: [string, string][] = [
    ['Bedtime', formatClockTime(night.bedtimeStart)],
    ['Wake time', formatClockTime(night.bedtimeEnd)],
    ['Time in bed', formatDuration(night.timeInBedSeconds)],
    ['Time asleep', night.totals.asleep === null ? '—' : formatDuration(night.totals.asleep)],
    ['Efficiency', night.efficiencyPercent === null ? '—' : formatPercent(night.efficiencyPercent)],
    ['Latency', night.latencySeconds === null ? '—' : formatDuration(night.latencySeconds)],
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
