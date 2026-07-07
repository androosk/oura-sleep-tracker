import { render } from '@testing-library/react-native';

import { TimingSection } from '../../components/TimingSection';

import sleepRealistic from '../fixtures/sleep.realistic.json';

import type { SleepDocument } from '../../api/types';

const night = sleepRealistic.data[0] as unknown as SleepDocument;

describe('TimingSection (US-008)', () => {
  it('shows bedtime and wake time in device-local time', () => {
    const { getByText } = render(<TimingSection night={night} />);
    expect(getByText('1:41 AM')).toBeTruthy();
    expect(getByText('9:23 AM')).toBeTruthy();
  });

  it('shows time in bed, time asleep, efficiency, and latency', () => {
    const { getByText } = render(<TimingSection night={night} />);
    expect(getByText('7h 42m')).toBeTruthy();
    expect(getByText('7h 32m')).toBeTruthy();
    expect(getByText('98%')).toBeTruthy();
    expect(getByText('9m')).toBeTruthy();
  });
});
