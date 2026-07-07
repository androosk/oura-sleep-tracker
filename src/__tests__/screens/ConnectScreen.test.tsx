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
});
