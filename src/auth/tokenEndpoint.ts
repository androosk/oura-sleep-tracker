import { z } from 'zod';

import { OuraAuthError, OuraHttpError, OuraNetworkError, OuraParseError } from '../api/errors';
import { buildCodeExchangeBody, buildRefreshBody, OURA_TOKEN_URL } from './oauthConfig';

import type { CodeExchangeParams, RefreshParams } from './oauthConfig';
import type { RefreshResult } from './tokenManager';

/**
 * The only place that talks to Oura's token endpoint. Error mapping matters:
 * 400/401 means the grant itself was rejected (OuraAuthError → the token
 * manager logs the user out); anything else — network trouble, a 500 — must
 * NOT destroy the session, so it maps to other error types.
 */

const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

async function postTokenRequest(body: string): Promise<RefreshResult> {
  let response: Response;
  try {
    response = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch {
    throw new OuraNetworkError();
  }

  if (response.status === 400 || response.status === 401) {
    throw new OuraAuthError('The Oura token endpoint rejected the grant.');
  }
  if (!response.ok) throw new OuraHttpError(response.status);

  const parsed = tokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new OuraParseError('Unexpected token endpoint response shape.');

  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token,
    expiresInSeconds: parsed.data.expires_in,
  };
}

export function exchangeCode(params: CodeExchangeParams): Promise<RefreshResult> {
  return postTokenRequest(buildCodeExchangeBody(params));
}

export function refreshTokens(params: RefreshParams): Promise<RefreshResult> {
  return postTokenRequest(buildRefreshBody(params));
}
