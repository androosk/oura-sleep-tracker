import type { RefreshResult, TokenStore } from '../auth/tokenManager';

/**
 * Completes the OAuth login: exchanges the authorization code and persists
 * the token pair. Exists as its own unit because the calling effect in
 * AppRoot can legitimately re-run with the SAME response (Fast Refresh
 * re-mounts effects in development) — and authorization codes are
 * single-use, so a replayed exchange must be skipped, not sent to Oura to
 * fail. All failures resolve to 'failed' rather than throwing: the caller
 * shows a factual message, and nothing becomes an unhandled rejection.
 *
 * Contract (src/__tests__/loginExchange.test.ts).
 */

export interface LoginExchangeDeps {
  exchange(code: string): Promise<RefreshResult>;
  store: TokenStore;
  now(): number;
}

export type LoginOutcome = 'completed' | 'duplicate' | 'failed';

export interface LoginExchanger {
  complete(code: string): Promise<LoginOutcome>;
}

export function createLoginExchanger(deps: LoginExchangeDeps): LoginExchanger {
  let handledCode: string | null = null;

  return {
    async complete(code) {
      if (code === handledCode) return 'duplicate';
      handledCode = code;
      try {
        const tokens = await deps.exchange(code);
        await deps.store.save({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: deps.now() + tokens.expiresInSeconds * 1000,
        });
        return 'completed';
      } catch {
        // Allow a retry: only a *successful* exchange consumes the code here.
        handledCode = null;
        return 'failed';
      }
    },
  };
}
