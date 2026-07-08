import { render } from '@testing-library/react-native';

import { ScoreRing } from '../../components/ScoreRing';

describe('ScoreRing (US-005)', () => {
  it('shows the score centered in the ring', () => {
    const { getByTestId, getByText } = render(<ScoreRing score={82} />);
    expect(getByTestId('score-ring')).toBeTruthy();
    expect(getByText('82')).toBeTruthy();
  });

  it('labels the ring factually (US-015)', () => {
    const { getByText } = render(<ScoreRing score={82} />);
    expect(getByText('Sleep score')).toBeTruthy();
  });

  it.each([
    [85, 'score-ring-optimal'],
    [82, 'score-ring-good'],
    [61, 'score-ring-attention'],
  ])('bands score %d as %s', (score, testId) => {
    const { getByTestId } = render(<ScoreRing score={score} />);
    expect(getByTestId(testId)).toBeTruthy();
  });

  it('renders a dash and the none band without a score', () => {
    const { getByTestId, getByText } = render(<ScoreRing score={null} />);
    expect(getByText('—')).toBeTruthy();
    expect(getByTestId('score-ring-none')).toBeTruthy();
  });
});
