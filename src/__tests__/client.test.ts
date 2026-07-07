import { createOuraClient } from '../api/client';
import { OuraAuthError, OuraNetworkError, OuraParseError, OuraRateLimitError } from '../api/errors';

import dailyRealistic from './fixtures/daily_sleep.realistic.json';

type FakeResponse = {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
};

function response(status: number, payload: unknown, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    json: async () => payload,
  } satisfies FakeResponse;
}

const okPage = (nextToken: string | null) => ({
  data: dailyRealistic.data,
  next_token: nextToken,
});

function makeClient(outcomes: (FakeResponse | Error)[]) {
  const fetchFn = jest.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => {
    const outcome = outcomes.shift();
    if (!outcome) throw new Error('test made more requests than expected');
    if (outcome instanceof Error) throw outcome;
    return outcome;
  });
  const refreshAccessToken = jest.fn(async () => 'token-2');
  const sleep = jest.fn(async (_ms: number) => {});
  const client = createOuraClient({
    fetchFn: fetchFn as unknown as typeof fetch,
    getAccessToken: async () => 'token-1',
    refreshAccessToken,
    sleep,
  });
  const requestUrl = (i: number) => String(fetchFn.mock.calls[i][0]);
  const requestHeaders = (i: number) =>
    (fetchFn.mock.calls[i][1]?.headers ?? {}) as Record<string, string>;
  return { client, fetchFn, refreshAccessToken, sleep, requestUrl, requestHeaders };
}

const range = { start: '2026-04-08', end: '2026-07-06' };

describe('OuraClient (US-004)', () => {
  it('requests the date range with a bearer token', async () => {
    const { client, requestUrl, requestHeaders } = makeClient([response(200, okPage(null))]);
    await client.fetchDailySleep(range);
    expect(requestUrl(0)).toContain('/v2/usercollection/daily_sleep');
    expect(requestUrl(0)).toContain('start_date=2026-04-08');
    expect(requestUrl(0)).toContain('end_date=2026-07-06');
    expect(requestHeaders(0)['Authorization']).toBe('Bearer token-1');
  });

  it('follows next_token pagination and concatenates pages', async () => {
    const { client, fetchFn, requestUrl } = makeClient([
      response(200, okPage('page-2-token')),
      response(200, okPage(null)),
    ]);
    const docs = await client.fetchDailySleep(range);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(requestUrl(1)).toContain('next_token=page-2-token');
    expect(docs).toHaveLength(2);
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const { client, refreshAccessToken, requestHeaders } = makeClient([
      response(401, { detail: 'expired' }),
      response(200, okPage(null)),
    ]);
    const docs = await client.fetchDailySleep(range);
    expect(docs).toHaveLength(1);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(requestHeaders(1)['Authorization']).toBe('Bearer token-2');
  });

  it('throws OuraAuthError when the retry after refresh is still 401', async () => {
    const { client, refreshAccessToken } = makeClient([
      response(401, { detail: 'expired' }),
      response(401, { detail: 'still expired' }),
    ]);
    await expect(client.fetchDailySleep(range)).rejects.toThrow(OuraAuthError);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('backs off per Retry-After on 429 and retries (UI never sees a raw 429)', async () => {
    const { client, sleep } = makeClient([
      response(429, {}, { 'retry-after': '2' }),
      response(200, okPage(null)),
    ]);
    const docs = await client.fetchDailySleep(range);
    expect(docs).toHaveLength(1);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it('gives up with OuraRateLimitError after repeated 429s', async () => {
    const { client } = makeClient([
      response(429, {}, { 'retry-after': '1' }),
      response(429, {}, { 'retry-after': '1' }),
      response(429, {}, { 'retry-after': '1' }),
    ]);
    await expect(client.fetchDailySleep(range)).rejects.toThrow(OuraRateLimitError);
  });

  it('wraps fetch failures in OuraNetworkError', async () => {
    const { client } = makeClient([new TypeError('Network request failed')]);
    await expect(client.fetchDailySleep(range)).rejects.toThrow(OuraNetworkError);
  });

  it('rejects malformed payloads with OuraParseError', async () => {
    const { client } = makeClient([response(200, { data: 'not-an-array' })]);
    await expect(client.fetchDailySleep(range)).rejects.toThrow(OuraParseError);
  });

  it('fetches sleep sessions from the sleep endpoint', async () => {
    const { client, requestUrl } = makeClient([response(200, { data: [], next_token: null })]);
    await client.fetchSleepSessions(range);
    expect(requestUrl(0)).toContain('/v2/usercollection/sleep');
  });
});
