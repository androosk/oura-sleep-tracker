import { render } from '@testing-library/react-native';

import { VitalsSection } from '../../components/VitalsSection';

import sleepRealistic from '../fixtures/sleep.realistic.json';

import type { SleepDocument } from '../../api/types';

const night = sleepRealistic.data[0] as unknown as SleepDocument;
const nap = sleepRealistic.data[1] as unknown as SleepDocument; // heart_rate/hrv are null

describe('VitalsSection (US-007)', () => {
  it('shows lowest HR, rounded average HR, and average HRV', () => {
    const { getByText } = render(<VitalsSection night={night} />);
    expect(getByText('48 bpm')).toBeTruthy();
    expect(getByText('55 bpm')).toBeTruthy(); // 54.5 rounds up
    expect(getByText('62 ms')).toBeTruthy();
  });

  it('renders both overnight charts when samples exist', () => {
    const { getByTestId } = render(<VitalsSection night={night} />);
    expect(getByTestId('vitals-hr-chart')).toBeTruthy();
    expect(getByTestId('vitals-hrv-chart')).toBeTruthy();
  });

  it('omits charts without erroring when samples are missing', () => {
    const { queryByTestId, getByText } = render(<VitalsSection night={nap} />);
    expect(queryByTestId('vitals-hr-chart')).toBeNull();
    expect(queryByTestId('vitals-hrv-chart')).toBeNull();
    expect(getByText('55 bpm')).toBeTruthy(); // lowest_heart_rate still shown
  });
});
