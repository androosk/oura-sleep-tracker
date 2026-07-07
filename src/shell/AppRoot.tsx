import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { createOuraClient } from '../api/client';
import { secureCredentialStore, secureTokenStore } from '../auth/expoSecureStores';
import { OURA_AUTHORIZE_URL, OURA_TOKEN_URL, REQUIRED_SCOPES } from '../auth/oauthConfig';
import { exchangeCode, refreshTokens } from '../auth/tokenEndpoint';
import { createTokenManager } from '../auth/tokenManager';
import { ConnectScreen } from '../screens/ConnectScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { useTheme } from '../theme/ThemeProvider';
import { MainTabs } from './MainTabs';

import type { OAuthCredentials } from '../auth/credentialStore';

WebBrowser.maybeCompleteAuthSession();

/**
 * Auth state machine: checking → needs-setup → needs-login → ready.
 * The user's own OAuth app credentials come first (US-002); then a one-time
 * browser login (US-003); after that the token manager keeps the session
 * alive with rotating refresh tokens until Oura revokes it, which routes
 * back to needs-login with a factual message.
 */

type AuthStage = 'checking' | 'needs-setup' | 'needs-login' | 'ready';

const redirectUri = makeRedirectUri({ scheme: 'ourasleep', path: 'callback' });

export function AppRoot(): ReactElement {
  const theme = useTheme();
  const [stage, setStage] = useState<AuthStage>('checking');
  const [credentials, setCredentials] = useState<OAuthCredentials | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await secureCredentialStore.load();
      setCredentials(stored);
      if (!stored) {
        setStage('needs-setup');
        return;
      }
      const hasTokens = (await secureTokenStore.load()) !== null;
      setStage(hasTokens ? 'ready' : 'needs-login');
    })();
  }, []);

  const services = useMemo(() => {
    if (!credentials) return null;
    const tokenManager = createTokenManager({
      store: secureTokenStore,
      refreshFn: (refreshToken) => refreshTokens({ ...credentials, refreshToken }),
      now: Date.now,
      onLoggedOut: () => {
        setSessionExpired(true);
        setStage('needs-login');
      },
    });
    const client = createOuraClient({
      fetchFn: fetch,
      getAccessToken: tokenManager.getAccessToken,
      refreshAccessToken: tokenManager.forceRefresh,
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    });
    return { tokenManager, client };
  }, [credentials]);

  // PKCE off: Oura's token endpoint authenticates with the client secret
  // instead. expo-auth-session still generates and verifies `state` for us.
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: credentials?.clientId ?? '',
      scopes: [...REQUIRED_SCOPES],
      redirectUri,
      usePKCE: false,
    },
    { authorizationEndpoint: OURA_AUTHORIZE_URL, tokenEndpoint: OURA_TOKEN_URL },
  );

  useEffect(() => {
    if (response?.type !== 'success' || !credentials) return;
    const code = response.params.code;
    (async () => {
      const tokens = await exchangeCode({ ...credentials, redirectUri, code });
      await secureTokenStore.save({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresInSeconds * 1000,
      });
      setSessionExpired(false);
      setStage('ready');
    })();
  }, [response, credentials]);

  let body: ReactElement | null;
  switch (stage) {
    case 'checking':
      body = null;
      break;
    case 'needs-setup':
      body = (
        <SetupScreen
          onSave={async (entered) => {
            await secureCredentialStore.save(entered);
            setCredentials(entered);
            setStage('needs-login');
          }}
        />
      );
      break;
    case 'needs-login':
      body = (
        <ConnectScreen
          onConnect={() => {
            if (request) void promptAsync();
          }}
          loggedOutReason={sessionExpired ? 'session-expired' : undefined}
          devRedirectUri={redirectUri}
        />
      );
      break;
    case 'ready':
      body = services ? <MainTabs client={services.client} /> : null;
      break;
  }

  return <View style={[styles.root, { backgroundColor: theme.background }]}>{body}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Clears the status bar / notch; MainTabs adds its own layout below this.
    paddingTop: 64,
  },
});
