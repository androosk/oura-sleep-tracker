import { fireEvent, render } from '@testing-library/react-native';

import { HistoryList } from '../../components/HistoryList';

import type { HistoryEntry } from '../../components/HistoryList';

const nights: HistoryEntry[] = [
  { day: '2026-07-01', score: 74, totalSleepSeconds: 24600 },
  { day: '2026-07-03', score: 82, totalSleepSeconds: 27120 },
  { day: '2026-07-02', score: null, totalSleepSeconds: null },
];

const noop = () => {};

describe('HistoryList (US-009)', () => {
  it('orders rows most recent first regardless of input order', () => {
    const { getAllByTestId } = render(
      <HistoryList nights={nights} onSelectNight={noop} onLoadOlder={noop} />,
    );
    const ids = getAllByTestId(/^history-row-/).map((row) => row.props.testID);
    expect(ids).toEqual([
      'history-row-2026-07-03',
      'history-row-2026-07-02',
      'history-row-2026-07-01',
    ]);
  });

  it('shows date label, score, and duration per row', () => {
    const { getByText } = render(
      <HistoryList nights={nights} onSelectNight={noop} onLoadOlder={noop} />,
    );
    expect(getByText('Fri, Jul 3')).toBeTruthy();
    expect(getByText('82')).toBeTruthy();
    expect(getByText('7h 32m')).toBeTruthy();
  });

  it('opens a night when its row is pressed', () => {
    const onSelectNight = jest.fn();
    const { getByTestId } = render(
      <HistoryList nights={nights} onSelectNight={onSelectNight} onLoadOlder={noop} />,
    );
    fireEvent.press(getByTestId('history-row-2026-07-01'));
    expect(onSelectNight).toHaveBeenCalledWith('2026-07-01');
  });

  it('requests older data when the end of the list is reached (FR-11)', () => {
    const onLoadOlder = jest.fn();
    const { getByTestId } = render(
      <HistoryList nights={nights} onSelectNight={noop} onLoadOlder={onLoadOlder} />,
    );
    fireEvent(getByTestId('history-list'), 'endReached');
    expect(onLoadOlder).toHaveBeenCalled();
  });

  it('shows the factual empty state with no rows (FR-12)', () => {
    const { getByTestId, queryAllByTestId } = render(
      <HistoryList nights={[]} onSelectNight={noop} onLoadOlder={noop} />,
    );
    expect(queryAllByTestId(/^history-row-/)).toHaveLength(0);
    expect(getByTestId('history-empty')).toBeTruthy();
  });
});
