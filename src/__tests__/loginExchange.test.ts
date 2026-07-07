import { createLoginExchanger } from '../shell/loginExchange';

import type { RefreshResult, StoredTokens } from '../auth/tokenManager';

const NOW = 1_760_000_000_000;

const tokens: RefreshResult = {
  accessToken: 'at-1',
  refreshToken: 'rt-1',
  expiresInSeconds: 86_400,
};

function makeStore() {
  let saved: StoredTokens | null = null;
  return {
    get saved() {
      return saved;
    },
    store: {
      load: async () => saved,
      save: async (value: StoredTokens) => {
        saved = value;
      },
      clear: async () => {
        saved = null;
      },
    },
  };
}

function makeExchanger(exchange: jest.Mock<Promise<RefreshResult>, [string]>) {
  const fake = makeStore();
  const exchanger = createLoginExchanger({ exchange, store: fake.store, now: () => NOW });
  return { exchanger, fake };
}

describe('loginExchange (US-003: code exchange survives Fast Refresh replays and failures)', () => {
  it('exchanges the code and persists the pair with the computed expiry', async () => {
    const exchange = jest.fn<Promise<RefreshResult>, [string]>().mockResolvedValue(tokens);
    const { exchanger, fake } = makeExchanger(exchange);
    await expect(exchanger.complete('code-1')).resolves.toBe('completed');
    expect(exchange).toHaveBeenCalledWith('code-1');
    expect(fake.saved).toEqual({
      accessToken: 'at-1',
      refreshToken: 'rt-1',
      expiresAt: NOW + 86_400_000,
    });
  });

  it('skips a replay of an already-exchanged code (single-use codes)', async () => {
    const exchange = jest.fn<Promise<RefreshResult>, [string]>().mockResolvedValue(tokens);
    const { exchanger } = makeExchanger(exchange);
    await exchanger.complete('code-1');
    await expect(exchanger.complete('code-1')).resolves.toBe('duplicate');
    expect(exchange).toHaveBeenCalledTimes(1);
  });

  it('resolves failed — never throws — when the endpoint rejects the code', async () => {
    const exchange = jest
      .fn<Promise<RefreshResult>, [string]>()
      .mockRejectedValue(new Error('rejected grant'));
    const { exchanger, fake } = makeExchanger(exchange);
    await expect(exchanger.complete('code-1')).resolves.toBe('failed');
    expect(fake.saved).toBeNull();
  });

  it('permits retrying after a failure instead of misreporting a duplicate', async () => {
    const exchange = jest
      .fn<Promise<RefreshResult>, [string]>()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce(tokens);
    const { exchanger } = makeExchanger(exchange);
    await expect(exchanger.complete('code-1')).resolves.toBe('failed');
    await expect(exchanger.complete('code-1')).resolves.toBe('completed');
    expect(exchange).toHaveBeenCalledTimes(2);
  });

  it('reports failed when the tokens cannot be persisted', async () => {
    const exchange = jest.fn<Promise<RefreshResult>, [string]>().mockResolvedValue(tokens);
    const fake = makeStore();
    fake.store.save = async () => {
      throw new Error('disk full');
    };
    const exchanger = createLoginExchanger({ exchange, store: fake.store, now: () => NOW });
    await expect(exchanger.complete('code-1')).resolves.toBe('failed');
  });
});
