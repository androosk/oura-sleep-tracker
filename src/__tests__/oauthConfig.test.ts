import {
  buildAuthorizeUrl,
  buildCodeExchangeBody,
  buildRefreshBody,
  OURA_AUTHORIZE_URL,
  REQUIRED_SCOPES,
} from '../auth/oauthConfig';

describe('buildAuthorizeUrl (US-003)', () => {
  const url = () =>
    buildAuthorizeUrl({
      clientId: 'cid',
      redirectUri: 'ourasleep://callback',
      state: 'random-state-value',
      scopes: ['daily', 'heartrate', 'personal'],
    });

  it('targets the Oura authorize endpoint with the code flow', () => {
    expect(url().startsWith(OURA_AUTHORIZE_URL)).toBe(true);
    expect(new URL(url()).searchParams.get('response_type')).toBe('code');
  });

  it('carries client, redirect, and space-joined scopes', () => {
    const params = new URL(url()).searchParams;
    expect(params.get('client_id')).toBe('cid');
    expect(params.get('redirect_uri')).toBe('ourasleep://callback');
    expect(params.get('scope')).toBe('daily heartrate personal');
  });

  it('includes the caller-supplied state for CSRF protection', () => {
    expect(new URL(url()).searchParams.get('state')).toBe('random-state-value');
  });
});

describe('token endpoint bodies (US-003)', () => {
  it('encodes the authorization-code exchange', () => {
    const body = new URLSearchParams(
      buildCodeExchangeBody({
        clientId: 'cid',
        clientSecret: 'sec',
        redirectUri: 'ourasleep://callback',
        code: 'auth-code-123',
      }),
    );
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('auth-code-123');
    expect(body.get('client_id')).toBe('cid');
    expect(body.get('client_secret')).toBe('sec');
    expect(body.get('redirect_uri')).toBe('ourasleep://callback');
  });

  it('encodes the refresh grant', () => {
    const body = new URLSearchParams(
      buildRefreshBody({ clientId: 'cid', clientSecret: 'sec', refreshToken: 'rt-1' }),
    );
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('refresh_token')).toBe('rt-1');
    expect(body.get('client_id')).toBe('cid');
    expect(body.get('client_secret')).toBe('sec');
  });
});

describe('required scopes', () => {
  it('covers sleep summaries and overnight heart rate', () => {
    expect(REQUIRED_SCOPES).toEqual(expect.arrayContaining(['daily', 'heartrate']));
  });
});
