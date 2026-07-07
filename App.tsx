import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

import { OuraAuthError } from './src/api/errors';
import { createEncryptedStorage } from './src/lib/encryptedStorage';
import { AppRoot } from './src/shell/AppRoot';
import { ThemeProvider } from './src/theme/ThemeProvider';

/**
 * Composition root. The persisted query cache is what makes the app readable
 * offline (US-012): queries render cached data immediately and refresh in
 * the background. The cache is AES-256-GCM ciphertext in AsyncStorage with
 * the key in the Keychain (see src/lib/encryptedStorage.ts) — tokens and
 * credentials live in the Keychain directly (src/auth/expoSecureStores.ts).
 */

const WEEK_MS = 7 * 24 * 3600 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: WEEK_MS,
      // Auth failures route to the login screen; retrying them is pointless.
      retry: (failureCount, error) => !(error instanceof OuraAuthError) && failureCount < 2,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: createEncryptedStorage({
    data: AsyncStorage,
    keychain: SecureStore,
    randomBytes: (byteLength) => Crypto.getRandomBytes(byteLength),
  }),
});

export default function App() {
  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: WEEK_MS }}
      >
        <AppRoot />
        <StatusBar style="auto" />
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
