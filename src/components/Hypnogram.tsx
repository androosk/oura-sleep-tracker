import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClockTime } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

import type { LocalizedTimestamp } from '../api/types';
import type { SleepStage, StageSegment } from '../lib/phases';

/**
 * Sleep-stage timeline chart (US-006). Each merged segment is a block whose
 * width is its share of the night and whose vertical position reflects stage
 * depth (awake on top, deep at the bottom), like Oura's chart.
 */

export interface HypnogramProps {
  segments: StageSegment[];
  bedtimeStart: LocalizedTimestamp;
  bedtimeEnd: LocalizedTimestamp;
}

const CHART_HEIGHT = 96;
const BLOCK_HEIGHT = 18;

/** Top offset per stage as a fraction of the drawable height. */
const STAGE_LEVEL: Record<SleepStage, number> = {
  awake: 0,
  rem: 1 / 3,
  light: 2 / 3,
  deep: 1,
  unknown: 2 / 3,
};

export function Hypnogram({ segments, bedtimeStart, bedtimeEnd }: HypnogramProps): ReactElement {
  const theme = useTheme();
  const totalSeconds = segments.reduce((sum, segment) => sum + segment.durationSeconds, 0);
  const stageColor: Record<SleepStage, string> = {
    awake: theme.stageAwake,
    rem: theme.stageRem,
    light: theme.stageLight,
    deep: theme.stageDeep,
    unknown: theme.scoreNone,
  };

  return (
    <View testID="hypnogram">
      <View style={styles.chart}>
        {segments.map((segment) => (
          <View
            key={segment.startOffsetSeconds}
            testID="hypnogram-segment"
            style={[
              styles.segment,
              {
                left: `${(segment.startOffsetSeconds / totalSeconds) * 100}%`,
                width: `${(segment.durationSeconds / totalSeconds) * 100}%`,
                top: STAGE_LEVEL[segment.stage] * (CHART_HEIGHT - BLOCK_HEIGHT),
                backgroundColor: stageColor[segment.stage],
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.axis}>
        <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>
          {formatClockTime(bedtimeStart)}
        </Text>
        <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>
          {formatClockTime(bedtimeEnd)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    height: CHART_HEIGHT,
  },
  segment: {
    position: 'absolute',
    height: BLOCK_HEIGHT,
    borderRadius: 3,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 12,
  },
});
