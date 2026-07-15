import { type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ContributorList } from '../components/ContributorList';
import { Hypnogram } from '../components/Hypnogram';
import { ScoreRing } from '../components/ScoreRing';
import { StageTotals } from '../components/StageTotals';
import { TimingSection } from '../components/TimingSection';
import { VitalsSection } from '../components/VitalsSection';
import { strings } from '../copy/strings';
import { useTheme } from '../theme/ThemeProvider';

import type { DailySleepDocument } from '../api/types';
import type { CompositeNight } from '../lib/composite';

/**
 * The last-night screen (US-005..US-008 composed). Presentational: data
 * arrives via props; fetching is wired up in the app container. The
 * empty-window status is the FR-12 case — no data anywhere in the synced
 * window, e.g. the ring hasn't been worn in months.
 */

export type HomeStatus = 'loading' | 'empty-window' | 'no-data-last-night' | 'error' | 'ready';

export interface HomeScreenProps {
  status: HomeStatus;
  daily?: DailySleepDocument;
  /** The whole night, fragments already stitched (US-015). */
  composite?: CompositeNight;
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

export function HomeScreen({ status, daily, composite }: HomeScreenProps): ReactElement {
  if (status === 'loading') return <Message testID="home-loading" text={strings.home.loading} />;
  if (status === 'empty-window')
    return <Message testID="home-empty-window" text={strings.home.emptyWindow} />;
  if (status === 'error') return <Message testID="home-error" text={strings.errors.network} />;
  if (status === 'no-data-last-night' || !composite)
    return <Message testID="home-no-data" text={strings.home.noDataLastNight} />;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScoreRing score={daily?.score ?? null} />
      {daily && (
        <Card title="Sleep contributors">
          <ContributorList contributors={daily.contributors} />
        </Card>
      )}
      <Card title="Sleep stages">
        <Hypnogram
          segments={composite.segments}
          bedtimeStart={composite.bedtimeStart}
          bedtimeEnd={composite.bedtimeEnd}
        />
        <StageTotals totals={composite.totals} />
      </Card>
      <Card title="Heart rate & HRV">
        <VitalsSection night={composite} />
      </Card>
      <Card title="Timing">
        <TimingSection night={composite} />
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
