import * as SecureStore from 'expo-secure-store';

import { createCredentialStore } from './credentialStore';

import type { StoredTokens, TokenStore } from './tokenManager';

/**
 * Production storage: both the OAuth app credentials and the token pair live
 * in the iOS Keychain via expo-secure-store. Nothing here ever touches
 * AsyncStorage.
 */

export const secureCredentialStore = createCredentialStore(SecureStore);

const TOKENS_KEY = 'oura.tokens';

export const secureTokenStore: TokenStore = {
  async load() {
    const raw = await SecureStore.getItemAsync(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  },
  async save(tokens) {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKENS_KEY);
  },
};
