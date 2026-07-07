import { render } from '@testing-library/react-native';

import { Hypnogram } from '../../components/Hypnogram';

import type { StageSegment } from '../../lib/phases';

const segments: StageSegment[] = [
  { stage: 'awake', startOffsetSeconds: 0, durationSeconds: 600 },
  { stage: 'light', startOffsetSeconds: 600, durationSeconds: 4800 },
  { stage: 'deep', startOffsetSeconds: 5400, durationSeconds: 3600 },
  { stage: 'rem', startOffsetSeconds: 9000, durationSeconds: 3000 },
  { stage: 'awake', startOffsetSeconds: 12000, durationSeconds: 600 },
];

describe('Hypnogram (US-006)', () => {
  const renderChart = () =>
    render(
      <Hypnogram
        segments={segments}
        bedtimeStart="2026-07-02T23:41:00-07:00"
        bedtimeEnd="2026-07-03T07:23:00-07:00"
      />,
    );

  it('draws one element per merged stage segment', () => {
    const { getByTestId, getAllByTestId } = renderChart();
    expect(getByTestId('hypnogram')).toBeTruthy();
    expect(getAllByTestId('hypnogram-segment')).toHaveLength(5);
  });

  it('labels the axis with local bedtime and wake time', () => {
    const { getByText } = renderChart();
    expect(getByText('1:41 AM')).toBeTruthy();
    expect(getByText('9:23 AM')).toBeTruthy();
  });
});
