import { NotImplementedError } from '../lib/notImplemented';

/**
 * Persistence for the user's own OAuth application credentials.
 * Backed by expo-secure-store (iOS Keychain) in the app; the interface is
 * injected so tests run against an in-memory fake. Credentials must never
 * touch AsyncStorage, logs, or error messages.
 *
 * Contract (src/__tests__/credentialStore.test.ts):
 * - save/load round-trips a credential pair.
 * - load resolves null before anything was saved.
 * - clear removes both values; a following load resolves null.
 */

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
}

/** Matches the subset of expo-secure-store this module is allowed to use. */
export interface SecureKV {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface CredentialStore {
  save(credentials: OAuthCredentials): Promise<void>;
  load(): Promise<OAuthCredentials | null>;
  clear(): Promise<void>;
}

export function createCredentialStore(_kv: SecureKV): CredentialStore {
  throw new NotImplementedError('createCredentialStore');
}
