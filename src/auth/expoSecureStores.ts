import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

import { createCredentialStore } from './credentialStore';

import type { TokenStore } from './tokenManager';

/**
 * Production storage: both the OAuth app credentials and the token pair live
 * in the iOS Keychain via expo-secure-store. Nothing here ever touches
 * AsyncStorage.
 */

export const secureCredentialStore = createCredentialStore(SecureStore);

const TOKENS_KEY = 'oura.tokens';

// Even a trusted store gets boundary validation: a corrupted or legacy
// Keychain value must read as logged-out, not crash or half-populate.
const storedTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});

export const secureTokenStore: TokenStore = {
  async load() {
    const raw = await SecureStore.getItemAsync(TOKENS_KEY);
    if (!raw) return null;
    try {
      const parsed = storedTokensSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },
  async save(tokens) {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKENS_KEY);
  },
};
