import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { splitSeriesAtGaps } from '../lib/series';
import { useTheme } from '../theme/ThemeProvider';

import type { SampleSeries, SleepDocument } from '../api/types';

/**
 * Overnight heart rate & HRV charts with summary values (US-007).
 * Charts are built from splitSeriesAtGaps: one polyline per unbroken run,
 * so null samples appear as gaps, never interpolated.
 */

export interface VitalsSectionProps {
  night: SleepDocument;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 64;

function SeriesChart({ series, testID }: { series: SampleSeries; testID: string }): ReactElement {
  const theme = useTheme();
  const runs = splitSeriesAtGaps(series);
  const values = runs.flat().map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spanSeconds = (series.items.length - 1) * series.interval || 1;
  const spanValue = max - min || 1;

  const x = (offsetSeconds: number) => (offsetSeconds / spanSeconds) * CHART_WIDTH;
  const y = (value: number) => CHART_HEIGHT - ((value - min) / spanValue) * (CHART_HEIGHT - 4) - 2;

  return (
    <View testID={testID}>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {runs.map((run) => (
          <Polyline
            key={run[0].offsetSeconds}
            points={run.map((point) => `${x(point.offsetSeconds)},${y(point.value)}`).join(' ')}
            fill="none"
            stroke={theme.chartLine}
            strokeWidth={1.5}
          />
        ))}
      </Svg>
    </View>
  );
}

export function VitalsSection({ night }: VitalsSectionProps): ReactElement {
  const theme = useTheme();
  const summaries: [string, string][] = [
    [
      'Lowest heart rate',
      night.lowest_heart_rate === null ? '—' : `${night.lowest_heart_rate} bpm`,
    ],
    [
      'Average heart rate',
      night.average_heart_rate === null ? '—' : `${Math.round(night.average_heart_rate)} bpm`,
    ],
    ['Average HRV', night.average_hrv === null ? '—' : `${night.average_hrv} ms`],
  ];

  return (
    <View>
      <View style={styles.summaryRow}>
        {summaries.map(([label, value]) => (
          <View key={label} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{value}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>
      {night.heart_rate && <SeriesChart series={night.heart_rate} testID="vitals-hr-chart" />}
      {night.hrv && <SeriesChart series={night.hrv} testID="vitals-hrv-chart" />}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
