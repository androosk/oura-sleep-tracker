import { fireEvent, render, within } from '@testing-library/react-native';

import { TrendsScreen } from '../../screens/TrendsScreen';

import type { TrendPoint } from '../../lib/stats';

const points: TrendPoint[] = [
  { day: '2026-07-01', score: 80, totalSleepSeconds: 27120 },
  { day: '2026-07-02', score: 82, totalSleepSeconds: 25200 },
  { day: '2026-07-03', score: null, totalSleepSeconds: null },
];

const noop = () => {};

describe('TrendsScreen (US-010)', () => {
  it('offers 2-week, 1-month, and 3-month periods', () => {
    const { getByTestId } = render(
      <TrendsScreen points={points} period="2w" onPeriodChange={noop} />,
    );
    expect(getByTestId('period-2w')).toBeTruthy();
    expect(getByTestId('period-1m')).toBeTruthy();
    expect(getByTestId('period-3m')).toBeTruthy();
  });

  it('reports period selection', () => {
    const onPeriodChange = jest.fn();
    const { getByTestId } = render(
      <TrendsScreen points={points} period="2w" onPeriodChange={onPeriodChange} />,
    );
    fireEvent.press(getByTestId('period-3m'));
    expect(onPeriodChange).toHaveBeenCalledWith('3m');
  });

  it('shows plain numeric averages, nulls excluded, no commentary', () => {
    const { getByTestId } = render(
      <TrendsScreen points={points} period="2w" onPeriodChange={noop} />,
    );
    expect(within(getByTestId('trend-average-score')).getByText('81')).toBeTruthy();
    expect(within(getByTestId('trend-average-duration')).getByText('7h 16m')).toBeTruthy();
  });
});
