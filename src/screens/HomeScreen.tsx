import { type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ContributorList } from '../components/ContributorList';
import { Hypnogram } from '../components/Hypnogram';
import { ScoreRing } from '../components/ScoreRing';
import { StageTotals } from '../components/StageTotals';
import { TimingSection } from '../components/TimingSection';
import { VitalsSection } from '../components/VitalsSection';
import { strings } from '../copy/strings';
import { parseSleepPhases } from '../lib/phases';
import { useTheme } from '../theme/ThemeProvider';

import type { DailySleepDocument, SleepDocument } from '../api/types';

/**
 * The last-night screen (US-005..US-008 composed). Presentational: data
 * arrives via props; fetching is wired up in the app container. The
 * empty-window status is the FR-12 case — no data anywhere in the synced
 * window, e.g. the ring hasn't been worn in months.
 */

export type HomeStatus = 'loading' | 'empty-window' | 'no-data-last-night' | 'ready';

export interface HomeScreenProps {
  status: HomeStatus;
  daily?: DailySleepDocument;
  night?: SleepDocument;
}

function Message({ testID, text }: { testID: string; text: string }): ReactElement {
  const theme = useTheme();
  return (
    <View testID={testID} style={styles.message}>
      <Text style={{ color: theme.textSecondary }}>{text}</Text>
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }): ReactElement {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

export function HomeScreen({ status, daily, night }: HomeScreenProps): ReactElement {
  if (status === 'loading') return <Message testID="home-loading" text={strings.home.loading} />;
  if (status === 'empty-window')
    return <Message testID="home-empty-window" text={strings.home.emptyWindow} />;
  if (status === 'no-data-last-night' || !daily || !night)
    return <Message testID="home-no-data" text={strings.home.noDataLastNight} />;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScoreRing score={daily.score} />
      <Card title="Sleep contributors">
        <ContributorList contributors={daily.contributors} />
      </Card>
      <Card title="Sleep stages">
        <Hypnogram
          segments={parseSleepPhases(night.sleep_phase_5_min ?? '')}
          bedtimeStart={night.bedtime_start}
          bedtimeEnd={night.bedtime_end}
        />
        <StageTotals night={night} />
      </Card>
      <Card title="Heart rate & HRV">
        <VitalsSection night={night} />
      </Card>
      <Card title="Timing">
        <TimingSection night={night} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
});
