import { OuraAuthError } from '../api/errors';

/**
 * Token lifecycle state machine. Owns the single source of truth for the
 * access/refresh token pair. Oura refresh tokens are SINGLE-USE: every
 * refresh returns a replacement refresh token, and losing it means the user
 * has to log in again — so the rotated pair is saved to the store before the
 * refresh promise resolves (crash-safe rotation). Concurrent callers share
 * one in-flight refresh. A refresh the token endpoint rejects clears the
 * store and logs the user out; a network failure during refresh does NOT log
 * out (being offline must not destroy the session).
 */

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds after which accessToken must not be used. */
  expiresAt: number;
}

export interface TokenStore {
  load(): Promise<StoredTokens | null>;
  save(tokens: StoredTokens): Promise<void>;
  clear(): Promise<void>;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface TokenManagerDeps {
  store: TokenStore;
  refreshFn(refreshToken: string): Promise<RefreshResult>;
  now(): number;
  onLoggedOut(): void;
}

export interface TokenManager {
  getAccessToken(): Promise<string>;
  /** 401-recovery path: refresh even if the token looks unexpired. */
  forceRefresh(): Promise<string>;
  isLoggedIn(): Promise<boolean>;
  logOut(): Promise<void>;
}

export function createTokenManager(deps: TokenManagerDeps): TokenManager {
  let refreshInFlight: Promise<string> | null = null;

  async function refreshNow(): Promise<string> {
    const stored = await deps.store.load();
    if (!stored) {
      deps.onLoggedOut();
      throw new OuraAuthError('No stored session to refresh.');
    }
    try {
      const result = await deps.refreshFn(stored.refreshToken);
      const rotated: StoredTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: deps.now() + result.expiresInSeconds * 1000,
      };
      await deps.store.save(rotated);
      return rotated.accessToken;
    } catch (error) {
      if (error instanceof OuraAuthError) {
        await deps.store.clear();
        deps.onLoggedOut();
      }
      throw error;
    }
  }

  function forceRefresh(): Promise<string> {
    if (!refreshInFlight) {
      refreshInFlight = refreshNow().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }

  return {
    forceRefresh,

    async getAccessToken() {
      const stored = await deps.store.load();
      if (!stored) throw new OuraAuthError('Not logged in.');
      if (stored.expiresAt > deps.now()) return stored.accessToken;
      return forceRefresh();
    },

    async isLoggedIn() {
      return (await deps.store.load()) !== null;
    },

    async logOut() {
      await deps.store.clear();
    },
  };
}
