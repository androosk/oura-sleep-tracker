import { createCredentialStore } from '../auth/credentialStore';

import type { SecureKV } from '../auth/credentialStore';

function makeFakeKeychain(): SecureKV {
  const data = new Map<string, string>();
  return {
    getItemAsync: async (key) => data.get(key) ?? null,
    setItemAsync: async (key, value) => {
      data.set(key, value);
    },
    deleteItemAsync: async (key) => {
      data.delete(key);
    },
  };
}

describe('credentialStore (US-002: Keychain-backed OAuth credentials)', () => {
  it('resolves null before anything was saved', async () => {
    const store = createCredentialStore(makeFakeKeychain());
    await expect(store.load()).resolves.toBeNull();
  });

  it('round-trips a credential pair', async () => {
    const store = createCredentialStore(makeFakeKeychain());
    await store.save({ clientId: 'my-client-id', clientSecret: 'my-secret' });
    await expect(store.load()).resolves.toEqual({
      clientId: 'my-client-id',
      clientSecret: 'my-secret',
    });
  });

  it('clear removes the credentials', async () => {
    const store = createCredentialStore(makeFakeKeychain());
    await store.save({ clientId: 'my-client-id', clientSecret: 'my-secret' });
    await store.clear();
    await expect(store.load()).resolves.toBeNull();
  });
});
