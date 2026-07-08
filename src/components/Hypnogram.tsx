import { Fragment, type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClockTime } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

import type { LocalizedTimestamp } from '../api/types';
import type { SleepStage, StageSegment } from '../lib/phases';

/**
 * Sleep-stage timeline chart (US-006, US-015). Segments are butted blocks at
 * stage depth (awake on top, deep at the bottom) joined by thin vertical
 * connectors at each transition, so the chart reads as one stepped line —
 * like Oura's. For a fragmented night the segments already span the whole
 * composite (gaps arrive as awake segments from buildCompositeNight).
 */

export interface HypnogramProps {
  segments: StageSegment[];
  bedtimeStart: LocalizedTimestamp;
  bedtimeEnd: LocalizedTimestamp;
}

const CHART_HEIGHT = 96;
const BLOCK_HEIGHT = 14;
const CONNECTOR_WIDTH = 1.5;

/** Top offset per stage as a fraction of the drawable height. */
const STAGE_LEVEL: Record<SleepStage, number> = {
  awake: 0,
  rem: 1 / 3,
  light: 2 / 3,
  deep: 1,
  unknown: 2 / 3,
};

const blockTop = (stage: SleepStage): number => STAGE_LEVEL[stage] * (CHART_HEIGHT - BLOCK_HEIGHT);

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
        {segments.map((segment, index) => {
          const next = segments[index + 1];
          return (
            <Fragment key={segment.startOffsetSeconds}>
              <View
                testID="hypnogram-segment"
                style={[
                  styles.segment,
                  {
                    left: `${(segment.startOffsetSeconds / totalSeconds) * 100}%`,
                    width: `${(segment.durationSeconds / totalSeconds) * 100}%`,
                    top: blockTop(segment.stage),
                    backgroundColor: stageColor[segment.stage],
                  },
                ]}
              />
              {next && (
                <View
                  testID="hypnogram-connector"
                  style={[
                    styles.connector,
                    {
                      left: `${(next.startOffsetSeconds / totalSeconds) * 100}%`,
                      top:
                        Math.min(blockTop(segment.stage), blockTop(next.stage)) + BLOCK_HEIGHT / 2,
                      height: Math.abs(blockTop(segment.stage) - blockTop(next.stage)),
                      backgroundColor: theme.divider,
                    },
                  ]}
                />
              )}
            </Fragment>
          );
        })}
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
    borderRadius: 1,
  },
  connector: {
    position: 'absolute',
    width: CONNECTOR_WIDTH,
    marginLeft: -CONNECTOR_WIDTH / 2,
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
