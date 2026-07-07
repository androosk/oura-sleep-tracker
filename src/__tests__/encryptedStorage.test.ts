import { createEncryptedStorage } from '../lib/encryptedStorage';

import type { SecureKV } from '../auth/credentialStore';
import type { AsyncKV } from '../lib/encryptedStorage';

/**
 * Contract for the encrypted cache persister (security audit 2026-07-06,
 * Medium finding): health data cached on disk must be ciphertext. The
 * encryption key lives in the Keychain, never beside the data.
 */

function makeDataStore() {
  const map = new Map<string, string>();
  return {
    map,
    store: {
      getItem: async (key: string) => map.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        map.set(key, value);
      },
      removeItem: async (key: string) => {
        map.delete(key);
      },
    } satisfies AsyncKV,
  };
}

function makeKeychain() {
  const map = new Map<string, string>();
  let writes = 0;
  return {
    map,
    get writes() {
      return writes;
    },
    store: {
      getItemAsync: async (key: string) => map.get(key) ?? null,
      setItemAsync: async (key: string, value: string) => {
        writes += 1;
        map.set(key, value);
      },
      deleteItemAsync: async (key: string) => {
        map.delete(key);
      },
    } satisfies SecureKV,
  };
}

/** Deterministic but never-repeating byte source. */
function makeRandomBytes() {
  let counter = 0;
  return (byteLength: number) => {
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = counter++ % 256;
    }
    return bytes;
  };
}

const PAYLOAD = '{"queries":[{"data":"sleep-score-82-hrv-62"}]}';

function makeStorage() {
  const data = makeDataStore();
  const keychain = makeKeychain();
  const randomBytes = makeRandomBytes();
  const storage = createEncryptedStorage({
    data: data.store,
    keychain: keychain.store,
    randomBytes,
  });
  return { storage, data, keychain, randomBytes };
}

describe('encryptedStorage (audit finding: health data must be ciphertext at rest)', () => {
  it('round-trips a value', async () => {
    const { storage } = makeStorage();
    await storage.setItem('cache', PAYLOAD);
    await expect(storage.getItem('cache')).resolves.toBe(PAYLOAD);
  });

  it('never writes plaintext to the underlying store', async () => {
    const { storage, data } = makeStorage();
    await storage.setItem('cache', PAYLOAD);
    const atRest = [...data.map.values()].join('');
    expect(atRest).not.toContain('sleep-score');
    expect(atRest).not.toContain(PAYLOAD);
  });

  it('produces different ciphertext for the same plaintext (fresh nonce per write)', async () => {
    const { storage, data } = makeStorage();
    await storage.setItem('a', PAYLOAD);
    await storage.setItem('b', PAYLOAD);
    expect(data.map.get('a')).not.toBe(data.map.get('b'));
  });

  it('persists the key so a new instance can decrypt existing data', async () => {
    const { storage, data, keychain } = makeStorage();
    await storage.setItem('cache', PAYLOAD);
    const second = createEncryptedStorage({
      data: data.store,
      keychain: keychain.store,
      randomBytes: makeRandomBytes(),
    });
    await expect(second.getItem('cache')).resolves.toBe(PAYLOAD);
  });

  it('keeps the encryption key in the keychain and never in the data store', async () => {
    const { storage, data, keychain } = makeStorage();
    await storage.setItem('cache', PAYLOAD);
    const keyMaterial = [...keychain.map.values()];
    expect(keyMaterial.length).toBeGreaterThan(0);
    const atRest = [...data.map.values()].join('');
    for (const key of keyMaterial) {
      expect(atRest).not.toContain(key);
    }
  });

  it('creates exactly one key across concurrent first writes', async () => {
    const { storage, keychain } = makeStorage();
    await Promise.all([
      storage.setItem('a', PAYLOAD),
      storage.setItem('b', PAYLOAD),
      storage.setItem('c', PAYLOAD),
    ]);
    expect(keychain.writes).toBe(1);
  });

  it('returns null for a missing key', async () => {
    const { storage } = makeStorage();
    await expect(storage.getItem('nope')).resolves.toBeNull();
  });

  it('treats undecryptable data as a cache miss, not a crash', async () => {
    const { storage, data } = makeStorage();
    await storage.setItem('cache', PAYLOAD);
    data.map.set('cache', 'ff00ff00corrupted');
    await expect(storage.getItem('cache')).resolves.toBeNull();
  });

  it('removes values', async () => {
    const { storage, data } = makeStorage();
    await storage.setItem('cache', PAYLOAD);
    await storage.removeItem('cache');
    expect(data.map.has('cache')).toBe(false);
    await expect(storage.getItem('cache')).resolves.toBeNull();
  });
});
