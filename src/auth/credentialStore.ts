/**
 * Persistence for the user's own OAuth application credentials.
 * Backed by expo-secure-store (iOS Keychain) in the app; the interface is
 * injected so tests run against an in-memory fake. Credentials must never
 * touch AsyncStorage, logs, or error messages.
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

const CLIENT_ID_KEY = 'oura.oauth.clientId';
const CLIENT_SECRET_KEY = 'oura.oauth.clientSecret';

export function createCredentialStore(kv: SecureKV): CredentialStore {
  return {
    async save(credentials) {
      await kv.setItemAsync(CLIENT_ID_KEY, credentials.clientId);
      await kv.setItemAsync(CLIENT_SECRET_KEY, credentials.clientSecret);
    },

    async load() {
      const clientId = await kv.getItemAsync(CLIENT_ID_KEY);
      const clientSecret = await kv.getItemAsync(CLIENT_SECRET_KEY);
      if (clientId === null || clientSecret === null) return null;
      return { clientId, clientSecret };
    },

    async clear() {
      await kv.deleteItemAsync(CLIENT_ID_KEY);
      await kv.deleteItemAsync(CLIENT_SECRET_KEY);
    },
  };
}
