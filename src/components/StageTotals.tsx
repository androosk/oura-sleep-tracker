import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

import type { SleepDocument } from '../api/types';

/**
 * Stage duration totals row (US-006).
 */

export interface StageTotalsProps {
  night: SleepDocument;
}

export function StageTotals({ night }: StageTotalsProps): ReactElement {
  const theme = useTheme();
  const entries: [string, number | null][] = [
    ['Total sleep', night.total_sleep_duration],
    ['Deep', night.deep_sleep_duration],
    ['REM', night.rem_sleep_duration],
    ['Light', night.light_sleep_duration],
    ['Awake', night.awake_time],
  ];

  return (
    <View style={styles.row}>
      {entries.map(([label, seconds]) => (
        <View key={label} style={styles.item}>
          <Text style={[styles.value, { color: theme.textPrimary }]}>
            {seconds === null ? '—' : formatDuration(seconds)}
          </Text>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    marginVertical: 6,
    minWidth: 64,
  },
  value: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
