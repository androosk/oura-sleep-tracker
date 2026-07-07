import { type ReactElement } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { OAuthCredentials } from '../auth/credentialStore';

/**
 * First-launch screen where the user enters their own Oura OAuth application
 * credentials (US-002, bring-your-own-credentials).
 *
 * Contract (src/__tests__/screens/SetupScreen.test.tsx):
 * - Inputs with testIDs 'setup-client-id' and 'setup-client-secret'.
 * - The save button (testID 'setup-save') is disabled until both fields are
 *   non-empty; pressing it calls onSave with the entered credentials.
 * - Renders strings.setup.explanation, which must mention
 *   cloud.ouraring.com so the user knows where to register.
 * - The secret input uses secureTextEntry.
 */

export interface SetupScreenProps {
  onSave(credentials: OAuthCredentials): void;
}

export function SetupScreen(_props: SetupScreenProps): ReactElement {
  throw new NotImplementedError('SetupScreen');
}
