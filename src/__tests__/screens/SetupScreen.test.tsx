import { fireEvent, render } from '@testing-library/react-native';

import { SetupScreen } from '../../screens/SetupScreen';

describe('SetupScreen (US-002)', () => {
  it('disables save until both credentials are entered', () => {
    const { getByTestId } = render(<SetupScreen onSave={() => {}} />);
    expect(getByTestId('setup-save')).toBeDisabled();
    fireEvent.changeText(getByTestId('setup-client-id'), 'my-client-id');
    expect(getByTestId('setup-save')).toBeDisabled();
    fireEvent.changeText(getByTestId('setup-client-secret'), 'my-secret');
    expect(getByTestId('setup-save')).toBeEnabled();
  });

  it('passes the entered credentials to onSave', () => {
    const onSave = jest.fn();
    const { getByTestId } = render(<SetupScreen onSave={onSave} />);
    fireEvent.changeText(getByTestId('setup-client-id'), 'my-client-id');
    fireEvent.changeText(getByTestId('setup-client-secret'), 'my-secret');
    fireEvent.press(getByTestId('setup-save'));
    expect(onSave).toHaveBeenCalledWith({ clientId: 'my-client-id', clientSecret: 'my-secret' });
  });

  it('masks the client secret input', () => {
    const { getByTestId } = render(<SetupScreen onSave={() => {}} />);
    expect(getByTestId('setup-client-secret').props.secureTextEntry).toBe(true);
  });

  it('explains where to register the OAuth app', () => {
    const { getByText } = render(<SetupScreen onSave={() => {}} />);
    expect(getByText(/developer\.ouraring\.com/)).toBeTruthy();
  });
});
