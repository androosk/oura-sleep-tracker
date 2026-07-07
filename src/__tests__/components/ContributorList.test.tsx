import { render } from '@testing-library/react-native';

import { ContributorList } from '../../components/ContributorList';

import type { SleepContributors } from '../../api/types';

const contributors: SleepContributors = {
  deep_sleep: 88,
  efficiency: 98,
  latency: 76,
  rem_sleep: 85,
  restfulness: 70,
  timing: 61,
  total_sleep: 90,
};

describe('ContributorList (US-005)', () => {
  it('renders one row per contributor', () => {
    const { getAllByTestId } = render(<ContributorList contributors={contributors} />);
    expect(getAllByTestId('contributor-row')).toHaveLength(7);
  });

  it('labels every contributor and shows its value', () => {
    const { getByText } = render(<ContributorList contributors={contributors} />);
    for (const label of [
      'Deep sleep',
      'Efficiency',
      'Latency',
      'REM sleep',
      'Restfulness',
      'Timing',
      'Total sleep',
    ]) {
      expect(getByText(label)).toBeTruthy();
    }
    for (const value of ['88', '98', '76', '85', '70', '61', '90']) {
      expect(getByText(value)).toBeTruthy();
    }
  });

  it('renders a dash for null contributors', () => {
    const { getByText } = render(
      <ContributorList contributors={{ ...contributors, deep_sleep: null }} />,
    );
    expect(getByText('—')).toBeTruthy();
  });
});
