import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from '@noble/ciphers/utils.js';

import type { SecureKV } from '../auth/credentialStore';

/**
 * Encryption layer for the persisted query cache (security audit 2026-07-06,
 * Medium finding). Values are AES-256-GCM ciphertext in the underlying
 * store; the key is generated on first use and lives in the iOS Keychain.
 * Undecryptable data (corruption, lost key) reads as a cache miss — the app
 * refetches rather than crashing.
 *
 * Pure JS (@noble/ciphers) rather than a native encrypted store (MMKV) so
 * the app keeps running in Expo Go. The payload is small — at most a few
 * hundred KB of sleep history — so the cost is negligible.
 */

export interface AsyncKV {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface EncryptedStorageDeps {
  /** Where ciphertext lives (AsyncStorage in the app). */
  data: AsyncKV;
  /** Where the key lives (expo-secure-store in the app). */
  keychain: SecureKV;
  /** Cryptographically secure random source (expo-crypto in the app). */
  randomBytes(byteLength: number): Uint8Array;
}

const KEY_KEYCHAIN_ENTRY = 'oura.cache.encryptionKey';
const KEY_LENGTH = 32;
const NONCE_LENGTH = 12;

export function createEncryptedStorage(deps: EncryptedStorageDeps): AsyncKV {
  // Memoized so concurrent first writes race to one key, not several.
  let keyPromise: Promise<Uint8Array> | null = null;

  function getOrCreateKey(): Promise<Uint8Array> {
    if (!keyPromise) {
      keyPromise = (async () => {
        const existing = await deps.keychain.getItemAsync(KEY_KEYCHAIN_ENTRY);
        if (existing) return hexToBytes(existing);
        const fresh = deps.randomBytes(KEY_LENGTH);
        await deps.keychain.setItemAsync(KEY_KEYCHAIN_ENTRY, bytesToHex(fresh));
        return fresh;
      })();
    }
    return keyPromise;
  }

  return {
    async getItem(key) {
      const stored = await deps.data.getItem(key);
      if (stored === null) return null;
      try {
        const cryptoKey = await getOrCreateKey();
        const bytes = hexToBytes(stored);
        const nonce = bytes.slice(0, NONCE_LENGTH);
        const ciphertext = bytes.slice(NONCE_LENGTH);
        return bytesToUtf8(gcm(cryptoKey, nonce).decrypt(ciphertext));
      } catch {
        // Wrong key, corruption, or tampering: a cache miss, never a crash.
        return null;
      }
    },

    async setItem(key, value) {
      const cryptoKey = await getOrCreateKey();
      const nonce = deps.randomBytes(NONCE_LENGTH);
      const ciphertext = gcm(cryptoKey, nonce).encrypt(utf8ToBytes(value));
      const combined = new Uint8Array(nonce.length + ciphertext.length);
      combined.set(nonce);
      combined.set(ciphertext, nonce.length);
      await deps.data.setItem(key, bytesToHex(combined));
    },

    async removeItem(key) {
      await deps.data.removeItem(key);
    },
  };
}
