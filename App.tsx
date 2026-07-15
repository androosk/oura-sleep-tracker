import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';

import { AppRoot } from './src/shell/AppRoot';
import { cachePersister, queryClient, WEEK_MS } from './src/shell/queryCache';
import { ThemeProvider } from './src/theme/ThemeProvider';

/**
 * Composition root. The persisted query cache is what makes the app readable
 * offline (US-012): queries render cached data immediately and refresh in
 * the background. The cache is AES-256-GCM ciphertext in AsyncStorage with
 * the key in the Keychain (see src/lib/encryptedStorage.ts) — tokens and
 * credentials live in the Keychain directly (src/auth/expoSecureStores.ts).
 * Cache construction and clearing live in src/shell/queryCache.ts.
 */

export default function App() {
  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: cachePersister, maxAge: WEEK_MS }}
      >
        <AppRoot />
        <StatusBar style="auto" />
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
