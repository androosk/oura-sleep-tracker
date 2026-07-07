import { NotImplementedError } from '../lib/notImplemented';

/**
 * Pure builders for the OAuth2 wire format (authorization-code flow).
 * Keeping these as data-in/data-out functions makes the security-sensitive
 * parts of auth directly unit-testable.
 *
 * Contract (src/__tests__/oauthConfig.test.ts):
 * - Authorize URL targets cloud.ouraring.com/oauth/authorize with
 *   response_type=code, client_id, redirect_uri, space-joined scope, and a
 *   caller-supplied state value (CSRF protection).
 * - Code-exchange and refresh bodies are form-encoded with the exact
 *   grant_type/parameter names the token endpoint expects.
 */

export const OURA_AUTHORIZE_URL = 'https://cloud.ouraring.com/oauth/authorize';
export const OURA_TOKEN_URL = 'https://api.ouraring.com/oauth/token';

/** Scopes this app needs: sleep summaries + overnight heart rate. */
export const REQUIRED_SCOPES = ['daily', 'heartrate', 'personal'];

export interface AuthorizeParams {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes: string[];
}

export function buildAuthorizeUrl(_params: AuthorizeParams): string {
  throw new NotImplementedError('buildAuthorizeUrl');
}

export interface CodeExchangeParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}

/** URLSearchParams-encoded body for exchanging an authorization code. */
export function buildCodeExchangeBody(_params: CodeExchangeParams): string {
  throw new NotImplementedError('buildCodeExchangeBody');
}

export interface RefreshParams {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/** URLSearchParams-encoded body for the refresh_token grant. */
export function buildRefreshBody(_params: RefreshParams): string {
  throw new NotImplementedError('buildRefreshBody');
}
