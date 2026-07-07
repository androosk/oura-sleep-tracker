import { fireEvent, render } from '@testing-library/react-native';

import { ConnectScreen } from '../../screens/ConnectScreen';

describe('ConnectScreen (US-003)', () => {
  it('starts the OAuth flow from the connect button', () => {
    const onConnect = jest.fn();
    const { getByTestId } = render(<ConnectScreen onConnect={onConnect} />);
    fireEvent.press(getByTestId('connect-oura'));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('states factually why the user is here after a failed refresh', () => {
    const { getByTestId } = render(
      <ConnectScreen onConnect={() => {}} loggedOutReason="session-expired" />,
    );
    expect(getByTestId('connect-logged-out-message')).toBeTruthy();
  });

  it('shows no logged-out message on a fresh login', () => {
    const { queryByTestId } = render(<ConnectScreen onConnect={() => {}} />);
    expect(queryByTestId('connect-logged-out-message')).toBeNull();
  });

  it('states factually when a login attempt did not complete', () => {
    const { getByTestId } = render(
      <ConnectScreen onConnect={() => {}} loggedOutReason="login-failed" />,
    );
    expect(getByTestId('connect-login-failed-message')).toBeTruthy();
  });

  // __DEV__ is true under Jest; in a production build the line is hidden
  // regardless of the prop.
  it('shows the computed redirect URI in development so it can be registered', () => {
    const { getByTestId, getByText } = render(
      <ConnectScreen onConnect={() => {}} devRedirectUri="exp://192.168.0.91:8081/--/callback" />,
    );
    expect(getByTestId('connect-dev-redirect')).toBeTruthy();
    expect(getByText(/exp:\/\/192\.168\.0\.91:8081\/--\/callback/)).toBeTruthy();
  });

  it('shows no redirect URI line when none is provided', () => {
    const { queryByTestId } = render(<ConnectScreen onConnect={() => {}} />);
    expect(queryByTestId('connect-dev-redirect')).toBeNull();
  });
});
