import { render } from '@testing-library/react-native';

import { buildCompositeNight } from '../../lib/composite';
import { HomeScreen } from '../../screens/HomeScreen';

import dailyRealistic from '../fixtures/daily_sleep.realistic.json';
import sleepRealistic from '../fixtures/sleep.realistic.json';

import type { DailySleepDocument, SleepDocument } from '../../api/types';

const daily = dailyRealistic.data[0] as unknown as DailySleepDocument;
const composite = buildCompositeNight([sleepRealistic.data[0] as unknown as SleepDocument])!;

describe('HomeScreen states (US-005, US-015, FR-12)', () => {
  it('shows a loading state', () => {
    const { getByTestId } = render(<HomeScreen status="loading" />);
    expect(getByTestId('home-loading')).toBeTruthy();
  });

  it('shows the empty-window state when the whole sync window has no data', () => {
    const { getByTestId } = render(<HomeScreen status="empty-window" />);
    expect(getByTestId('home-empty-window')).toBeTruthy();
  });

  it('shows the no-data-last-night state', () => {
    const { getByTestId } = render(<HomeScreen status="no-data-last-night" />);
    expect(getByTestId('home-no-data')).toBeTruthy();
  });

  it('renders the full composite night when data is ready', () => {
    const { getByText, getByTestId } = render(
      <HomeScreen status="ready" daily={daily} composite={composite} />,
    );
    expect(getByTestId('score-ring')).toBeTruthy();
    expect(getByText('82')).toBeTruthy(); // the daily score
    expect(getByTestId('hypnogram')).toBeTruthy();
    expect(getByText('98%')).toBeTruthy(); // efficiency from the timing section
  });
});
