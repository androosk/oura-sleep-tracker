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

  // Gate fix (MED): a failed fetch with an empty cache must say the API was
  // unreachable — not masquerade as the FR-12 "no data in 90 days" state.
  it('shows a factual error state when fetching failed with no cached data', () => {
    const { getByTestId } = render(<HomeScreen status="error" />);
    expect(getByTestId('home-error')).toBeTruthy();
  });

  // Gate fix (LOW): a night with sessions but no daily score doc must still
  // render the night, with the ring showing no score.
  it('renders the night with a score-less ring when the daily doc is missing', () => {
    const { getByTestId, getByText } = render(<HomeScreen status="ready" composite={composite} />);
    expect(getByTestId('score-ring-none')).toBeTruthy();
    expect(getByText('—')).toBeTruthy();
    expect(getByTestId('hypnogram')).toBeTruthy();
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
