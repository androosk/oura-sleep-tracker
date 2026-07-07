import { OuraAuthError } from '../api/errors';
import { createTokenManager } from '../auth/tokenManager';

import type { RefreshResult, StoredTokens, TokenManagerDeps } from '../auth/tokenManager';

function makeFakeStore(initial: StoredTokens | null) {
  let saved: StoredTokens | null = initial;
  const ops: string[] = [];
  return {
    ops,
    get saved() {
      return saved;
    },
    store: {
      load: async () => saved,
      save: async (tokens: StoredTokens) => {
        saved = tokens;
        ops.push(`save:${tokens.refreshToken}`);
      },
      clear: async () => {
        saved = null;
        ops.push('clear');
      },
    },
  };
}

const NOW = 1_760_000_000_000;

const validTokens: StoredTokens = {
  accessToken: 'at-1',
  refreshToken: 'rt-1',
  expiresAt: NOW + 60_000,
};

const expiredTokens: StoredTokens = { ...validTokens, expiresAt: NOW - 1 };

const rotation = (n: number): RefreshResult => ({
  accessToken: `at-${n}`,
  refreshToken: `rt-${n}`,
  expiresInSeconds: 86_400,
});

function makeManager(
  initial: StoredTokens | null,
  refreshFn: jest.Mock<Promise<RefreshResult>, [string]>,
) {
  const fake = makeFakeStore(initial);
  const onLoggedOut = jest.fn();
  const deps: TokenManagerDeps = { store: fake.store, refreshFn, now: () => NOW, onLoggedOut };
  return { manager: createTokenManager(deps), fake, onLoggedOut };
}

describe('tokenManager (US-003: single-use refresh token rotation)', () => {
  it('returns the stored access token while it is still valid, without refreshing', async () => {
    const refreshFn = jest.fn<Promise<RefreshResult>, [string]>();
    const { manager } = makeManager(validTokens, refreshFn);
    await expect(manager.getAccessToken()).resolves.toBe('at-1');
    expect(refreshFn).not.toHaveBeenCalled();
  });

  it('refreshes an expired token and persists the rotated pair', async () => {
    const refreshFn = jest.fn<Promise<RefreshResult>, [string]>().mockResolvedValue(rotation(2));
    const { manager, fake } = makeManager(expiredTokens, refreshFn);
    await expect(manager.getAccessToken()).resolves.toBe('at-2');
    expect(refreshFn).toHaveBeenCalledWith('rt-1');
    expect(fake.saved).toMatchObject({ accessToken: 'at-2', refreshToken: 'rt-2' });
  });

  it('fails the refresh if the rotated pair cannot be persisted (save is awaited)', async () => {
    const refreshFn = jest.fn<Promise<RefreshResult>, [string]>().mockResolvedValue(rotation(2));
    const fake = makeFakeStore(expiredTokens);
    fake.store.save = async () => {
      throw new Error('disk full');
    };
    const manager = createTokenManager({
      store: fake.store,
      refreshFn,
      now: () => NOW,
      onLoggedOut: jest.fn(),
    });
    await expect(manager.getAccessToken()).rejects.toThrow();
  });

  it('shares a single refresh between concurrent callers', async () => {
    const refreshFn = jest.fn<Promise<RefreshResult>, [string]>().mockResolvedValue(rotation(2));
    const { manager } = makeManager(expiredTokens, refreshFn);
    const [a, b] = await Promise.all([manager.getAccessToken(), manager.getAccessToken()]);
    expect(a).toBe('at-2');
    expect(b).toBe('at-2');
    expect(refreshFn).toHaveBeenCalledTimes(1);
  });

  it('uses the rotated refresh token for the next refresh, never the original', async () => {
    const refreshFn = jest
      .fn<Promise<RefreshResult>, [string]>()
      .mockResolvedValueOnce(rotation(2))
      .mockResolvedValueOnce(rotation(3));
    const { manager } = makeManager(expiredTokens, refreshFn);
    await manager.getAccessToken();
    await expect(manager.forceRefresh()).resolves.toBe('at-3');
    expect(refreshFn).toHaveBeenNthCalledWith(1, 'rt-1');
    expect(refreshFn).toHaveBeenNthCalledWith(2, 'rt-2');
  });

  it('logs out when the token endpoint rejects the refresh', async () => {
    const refreshFn = jest
      .fn<Promise<RefreshResult>, [string]>()
      .mockRejectedValue(new OuraAuthError('refresh token revoked'));
    const { manager, fake, onLoggedOut } = makeManager(expiredTokens, refreshFn);
    await expect(manager.getAccessToken()).rejects.toThrow(OuraAuthError);
    expect(fake.saved).toBeNull();
    expect(onLoggedOut).toHaveBeenCalledTimes(1);
  });

  it('reports login state from the store', async () => {
    const refreshFn = jest.fn<Promise<RefreshResult>, [string]>();
    const loggedIn = makeManager(validTokens, refreshFn);
    const loggedOut = makeManager(null, refreshFn);
    await expect(loggedIn.manager.isLoggedIn()).resolves.toBe(true);
    await expect(loggedOut.manager.isLoggedIn()).resolves.toBe(false);
  });

  it('logOut clears the stored tokens', async () => {
    const refreshFn = jest.fn<Promise<RefreshResult>, [string]>();
    const { manager, fake } = makeManager(validTokens, refreshFn);
    await manager.logOut();
    expect(fake.saved).toBeNull();
  });
});
