import { OuraAuthError, OuraHttpError, OuraNetworkError, OuraRateLimitError } from './errors';
import { parseDailySleepResponse, parseSleepResponse } from './schemas';

import type { DailySleepDocument, DateRange, Paginated, SleepDocument } from './types';

/**
 * Oura API client. All effects are injected so the contract tests can run it
 * against fake fetch/clock implementations.
 *
 * Behavior:
 * - Sends start_date/end_date query params and a Bearer token header.
 * - Follows next_token pagination until exhausted, concatenating pages.
 * - On 401: asks for one token refresh and retries once; a second 401 throws
 *   OuraAuthError.
 * - On 429: waits per Retry-After via the injected sleep and retries, at most
 *   3 attempts, then throws OuraRateLimitError.
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

const MAX_RATE_LIMIT_ATTEMPTS = 3;

export function createOuraClient(deps: OuraClientDeps): OuraClient {
  const baseUrl = deps.baseUrl ?? OURA_API_BASE_URL;

  async function requestPage(path: string, params: URLSearchParams): Promise<unknown> {
    let token = await deps.getAccessToken();
    let hasRefreshed = false;
    let rateLimitAttempts = 0;

    for (;;) {
      let response: Response;
      try {
        response = await deps.fetchFn(`${baseUrl}${path}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        throw new OuraNetworkError();
      }

      if (response.status === 401) {
        if (hasRefreshed) throw new OuraAuthError();
        token = await deps.refreshAccessToken();
        hasRefreshed = true;
        continue;
      }

      if (response.status === 429) {
        rateLimitAttempts += 1;
        if (rateLimitAttempts >= MAX_RATE_LIMIT_ATTEMPTS) throw new OuraRateLimitError();
        const retryAfterSeconds = Number(response.headers.get('Retry-After') ?? '1');
        await deps.sleep(retryAfterSeconds * 1000);
        continue;
      }

      if (!response.ok) throw new OuraHttpError(response.status);

      return response.json();
    }
  }

  async function fetchAllPages<T>(
    path: string,
    range: DateRange,
    parse: (json: unknown) => Paginated<T>,
  ): Promise<T[]> {
    const documents: T[] = [];
    let nextToken: string | null = null;
    do {
      const params = new URLSearchParams({ start_date: range.start, end_date: range.end });
      if (nextToken) params.set('next_token', nextToken);
      const page = parse(await requestPage(path, params));
      documents.push(...page.data);
      nextToken = page.next_token;
    } while (nextToken);
    return documents;
  }

  return {
    fetchDailySleep: (range) =>
      fetchAllPages('/v2/usercollection/daily_sleep', range, parseDailySleepResponse),
    fetchSleepSessions: (range) =>
      fetchAllPages('/v2/usercollection/sleep', range, parseSleepResponse),
  };
}
