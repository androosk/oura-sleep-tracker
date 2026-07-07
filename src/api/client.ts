import { NotImplementedError } from '../lib/notImplemented';

import type { DailySleepDocument, DateRange, SleepDocument } from './types';

/**
 * Oura API client. All effects are injected so the contract tests can run it
 * against fake fetch/clock implementations.
 *
 * Contract (src/__tests__/client.test.ts):
 * - Sends start_date/end_date query params and a Bearer token header.
 * - Follows next_token pagination until exhausted, concatenating pages.
 * - On 401: asks for one token refresh (refreshAccessToken) and retries once;
 *   a second 401 throws OuraAuthError.
 * - On 429: waits per Retry-After via the injected sleep and retries, at most
 *   3 attempts, then throws OuraRateLimitError. The UI never sees a raw 429.
 * - Network failures throw OuraNetworkError; other statuses OuraHttpError.
 * - Responses are validated via schemas.ts (OuraParseError on mismatch).
 */

export interface OuraClientDeps {
  fetchFn: typeof fetch;
  getAccessToken(): Promise<string>;
  /** Force-refresh after a 401; resolves with the new access token. */
  refreshAccessToken(): Promise<string>;
  sleep(ms: number): Promise<void>;
  baseUrl?: string;
}

export interface OuraClient {
  fetchDailySleep(range: DateRange): Promise<DailySleepDocument[]>;
  fetchSleepSessions(range: DateRange): Promise<SleepDocument[]>;
}

export const OURA_API_BASE_URL = 'https://api.ouraring.com';

export function createOuraClient(_deps: OuraClientDeps): OuraClient {
  throw new NotImplementedError('createOuraClient');
}
