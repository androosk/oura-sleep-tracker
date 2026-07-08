import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';

import type { CompositeNight } from '../lib/composite';
import type { SeriesPoint } from '../lib/series';

/**
 * Overnight heart rate & HRV charts with summary values (US-007, US-015).
 * Runs arrive pre-split and pre-offset from buildCompositeNight: gaps —
 * within a fragment or between fragments — are never bridged by a line.
 */

export interface VitalsSectionProps {
  night: CompositeNight;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 64;

function RunsChart({
  runs,
  spanSeconds,
  testID,
}: {
  runs: SeriesPoint[][];
  spanSeconds: number;
  testID: string;
}): ReactElement {
  const theme = useTheme();
  const values = runs.flat().map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spanValue = max - min || 1;

  const x = (offsetSeconds: number) => (offsetSeconds / (spanSeconds || 1)) * CHART_WIDTH;
  const y = (value: number) => CHART_HEIGHT - ((value - min) / spanValue) * (CHART_HEIGHT - 4) - 2;

  return (
    <View testID={testID} style={styles.chart}>
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
    ['Lowest heart rate', night.lowestHeartRate === null ? '—' : `${night.lowestHeartRate} bpm`],
    [
      'Average heart rate',
      night.averageHeartRate === null ? '—' : `${Math.round(night.averageHeartRate)} bpm`,
    ],
    ['Average HRV', night.averageHrv === null ? '—' : `${Math.round(night.averageHrv)} ms`],
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
      {night.heartRateRuns.length > 0 && (
        <RunsChart
          runs={night.heartRateRuns}
          spanSeconds={night.timeInBedSeconds}
          testID="vitals-hr-chart"
        />
      )}
      {night.hrvRuns.length > 0 && (
        <RunsChart
          runs={night.hrvRuns}
          spanSeconds={night.timeInBedSeconds}
          testID="vitals-hrv-chart"
        />
      )}
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
  chart: {
    marginTop: 8,
  },
});
