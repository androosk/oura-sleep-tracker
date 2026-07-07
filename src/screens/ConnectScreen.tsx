import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../copy/strings';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Login screen: a single action that starts the OAuth flow (US-003). Also
 * shown after a failed token refresh, with a factual explanation.
 */

export interface ConnectScreenProps {
  onConnect(): void;
  loggedOutReason?: 'session-expired' | 'login-failed';
  /**
   * The redirect URI the OAuth request will actually use. Shown only in dev
   * builds: under Expo Go it resolves to an exp:// URL that must be
   * registered in the user's Oura application, and seeing the exact value
   * beats guessing it from Metro's banner.
   */
  devRedirectUri?: string;
}

export function ConnectScreen({
  onConnect,
  loggedOutReason,
  devRedirectUri,
}: ConnectScreenProps): ReactElement {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{strings.connect.title}</Text>
      {loggedOutReason === 'session-expired' && (
        <Text
          testID="connect-logged-out-message"
          style={[styles.message, { color: theme.textSecondary }]}
        >
          {strings.errors.loggedOut}
        </Text>
      )}
      {loggedOutReason === 'login-failed' && (
        <Text
          testID="connect-login-failed-message"
          style={[styles.message, { color: theme.textSecondary }]}
        >
          {strings.errors.loginFailed}
        </Text>
      )}
      <Pressable
        testID="connect-oura"
        onPress={onConnect}
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={[styles.buttonLabel, { color: theme.background }]}>
          {strings.connect.button}
        </Text>
      </Pressable>
      {__DEV__ && devRedirectUri && (
        <Text
          testID="connect-dev-redirect"
          selectable
          style={[styles.devRedirect, { color: theme.textSecondary }]}
        >
          {`${strings.connect.devRedirectLabel} ${devRedirectUri}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  devRedirect: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
