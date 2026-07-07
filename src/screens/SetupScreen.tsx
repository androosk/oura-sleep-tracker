import { useState, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { strings } from '../copy/strings';
import { useTheme } from '../theme/ThemeProvider';

import type { OAuthCredentials } from '../auth/credentialStore';

/**
 * First-launch screen where the user enters their own Oura OAuth application
 * credentials (US-002, bring-your-own-credentials). Save stays disabled
 * until both fields are non-empty; the secret input is masked.
 */

export interface SetupScreenProps {
  onSave(credentials: OAuthCredentials): void;
}

export function SetupScreen({ onSave }: SetupScreenProps): ReactElement {
  const theme = useTheme();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const canSave = clientId.trim().length > 0 && clientSecret.trim().length > 0;

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.divider },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{strings.setup.title}</Text>
      <Text style={[styles.explanation, { color: theme.textSecondary }]}>
        {strings.setup.explanation}
      </Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {strings.setup.clientIdLabel}
      </Text>
      <TextInput
        testID="setup-client-id"
        value={clientId}
        onChangeText={setClientId}
        autoCapitalize="none"
        autoCorrect={false}
        style={inputStyle}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {strings.setup.clientSecretLabel}
      </Text>
      <TextInput
        testID="setup-client-secret"
        value={clientSecret}
        onChangeText={setClientSecret}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={inputStyle}
      />

      <Pressable
        testID="setup-save"
        disabled={!canSave}
        onPress={() => onSave({ clientId: clientId.trim(), clientSecret: clientSecret.trim() })}
        style={[styles.saveButton, { backgroundColor: canSave ? theme.accent : theme.divider }]}
      >
        <Text style={[styles.saveLabel, { color: theme.background }]}>
          {strings.setup.saveButton}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    fontSize: 15,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },
  saveLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
