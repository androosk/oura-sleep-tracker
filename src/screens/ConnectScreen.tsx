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
  loggedOutReason?: 'session-expired';
}

export function ConnectScreen({ onConnect, loggedOutReason }: ConnectScreenProps): ReactElement {
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
      <Pressable
        testID="connect-oura"
        onPress={onConnect}
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={[styles.buttonLabel, { color: theme.background }]}>
          {strings.connect.button}
        </Text>
      </Pressable>
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
});
