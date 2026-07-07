import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

/**
 * Login screen: a single action that starts the OAuth flow (US-003). Also
 * shown after a failed token refresh, with a factual explanation.
 *
 * Contract (src/__tests__/screens/ConnectScreen.test.tsx):
 * - Button testID 'connect-oura' calls onConnect when pressed.
 * - When loggedOutReason is 'session-expired', renders strings.errors.loggedOut.
 */

export interface ConnectScreenProps {
  onConnect(): void;
  loggedOutReason?: 'session-expired';
}

export function ConnectScreen(_props: ConnectScreenProps): ReactElement {
  throw new NotImplementedError('ConnectScreen');
}
