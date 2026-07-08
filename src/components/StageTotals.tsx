import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

import type { CompositeTotals } from '../lib/composite';

/**
 * Stage duration totals row (US-006). Totals arrive summed across the
 * night's fragments (US-015) — recorded stage time only, gaps excluded.
 */

export interface StageTotalsProps {
  totals: CompositeTotals;
}

export function StageTotals({ totals }: StageTotalsProps): ReactElement {
  const theme = useTheme();
  const entries: [string, number | null][] = [
    ['Total sleep', totals.asleep],
    ['Deep', totals.deep],
    ['REM', totals.rem],
    ['Light', totals.light],
    ['Awake', totals.awake],
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
    marginTop: 12,
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
