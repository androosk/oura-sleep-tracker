import { render } from '@testing-library/react-native';

import { StageTotals } from '../../components/StageTotals';

import sleepRealistic from '../fixtures/sleep.realistic.json';

import type { SleepDocument } from '../../api/types';

const night = sleepRealistic.data[0] as unknown as SleepDocument;

describe('StageTotals (US-006)', () => {
  it('shows formatted totals for sleep and each stage', () => {
    const { getByText } = render(<StageTotals night={night} />);
    expect(getByText('7h 32m')).toBeTruthy(); // total sleep
    expect(getByText('1h 30m')).toBeTruthy(); // deep
    expect(getByText('1h 45m')).toBeTruthy(); // REM
    expect(getByText('4h 17m')).toBeTruthy(); // light
    expect(getByText('10m')).toBeTruthy(); // awake
  });

  it('renders a dash for missing durations', () => {
    const { getByText } = render(<StageTotals night={{ ...night, deep_sleep_duration: null }} />);
    expect(getByText('—')).toBeTruthy();
  });
});
