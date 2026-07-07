/**
 * Pure builders for the OAuth2 wire format (authorization-code flow).
 * Keeping these as data-in/data-out functions makes the security-sensitive
 * parts of auth directly unit-testable.
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

export function buildAuthorizeUrl(params: AuthorizeParams): string {
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: params.scopes.join(' '),
    state: params.state,
  });
  return `${OURA_AUTHORIZE_URL}?${query.toString()}`;
}

export interface CodeExchangeParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}

/** URLSearchParams-encoded body for exchanging an authorization code. */
export function buildCodeExchangeBody(params: CodeExchangeParams): string {
  return new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
  }).toString();
}

export interface RefreshParams {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/** URLSearchParams-encoded body for the refresh_token grant. */
export function buildRefreshBody(params: RefreshParams): string {
  return new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  }).toString();
}
