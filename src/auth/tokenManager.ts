import { NotImplementedError } from '../lib/notImplemented';

/**
 * Token lifecycle state machine. Owns the single source of truth for the
 * access/refresh token pair. Oura refresh tokens are SINGLE-USE: every
 * refresh returns a replacement refresh token, and losing it means the user
 * has to log in again — hence the persistence-before-resolve rule below.
 *
 * Contract (src/__tests__/tokenManager.test.ts):
 * - getAccessToken returns the stored token untouched while it is still valid.
 * - An expired token triggers exactly one refresh; the rotated token pair is
 *   SAVED TO THE STORE BEFORE the promise resolves (crash-safe rotation).
 * - Concurrent getAccessToken calls during a refresh share one refresh call.
 * - A subsequent refresh uses the rotated refresh token, not the original.
 * - A refresh rejected by the token endpoint clears the store, calls
 *   onLoggedOut, and throws OuraAuthError.
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

export function createTokenManager(_deps: TokenManagerDeps): TokenManager {
  throw new NotImplementedError('createTokenManager');
}
