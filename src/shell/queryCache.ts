import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, focusManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

import { OuraAuthError } from '../api/errors';
import { createEncryptedStorage } from '../lib/encryptedStorage';

/**
 * The query cache and its encrypted persistence, in one place so auth code
 * can clear it. Two gate findings (2026-07-08) live here:
 * - The cache carries no account identity, so logout/login MUST wipe it or a
 *   different Oura account would see the previous account's sleep data.
 * - React Native never fires web "window focus"; without wiring AppState
 *   into focusManager, data only refreshed on cold start.
 */

export const WEEK_MS = 7 * 24 * 3600 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: WEEK_MS,
      // Auth failures route to the login screen; retrying them is pointless.
      retry: (failureCount, error) => !(error instanceof OuraAuthError) && failureCount < 2,
    },
  },
});

export const cachePersister = createAsyncStoragePersister({
  storage: createEncryptedStorage({
    data: AsyncStorage,
    keychain: SecureStore,
    randomBytes: (byteLength) => Crypto.getRandomBytes(byteLength),
  }),
});

/** Foreground the app → mark focused → stale queries refetch. */
AppState.addEventListener('change', (state) => {
  focusManager.setFocused(state === 'active');
});

/** Wipes cached sleep data in memory and at rest (logout / account switch). */
export async function clearSleepDataCache(): Promise<void> {
  queryClient.clear();
  await cachePersister.removeClient();
}
