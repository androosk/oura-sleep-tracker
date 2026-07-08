import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { strings } from '../copy/strings';
import { scoreCategory } from '../lib/scoreColor';
import { useTheme } from '../theme/ThemeProvider';

/**
 * The large circular sleep-score gauge (US-005). A thin ring whose filled
 * fraction is score/100, colored by the Oura score band.
 */

export interface ScoreRingProps {
  score: number | null;
}

const SIZE = 180;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score }: ScoreRingProps): ReactElement {
  const theme = useTheme();
  const category = scoreCategory(score);
  const bandColor = {
    optimal: theme.scoreOptimal,
    good: theme.scoreGood,
    attention: theme.scoreAttention,
    none: theme.scoreNone,
  }[category];
  const filled = CIRCUMFERENCE * ((score ?? 0) / 100);

  return (
    <View testID="score-ring" style={styles.container}>
      <View testID={`score-ring-${category}`}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.divider}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={bandColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            // Start the arc at 12 o'clock instead of 3 o'clock.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.scoreOverlay}>
          <Text style={[styles.scoreText, { color: theme.textPrimary }]}>{score ?? '—'}</Text>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
            {strings.home.scoreLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '200',
  },
  scoreLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});
