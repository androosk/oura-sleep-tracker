import { type ReactElement, type ReactNode } from 'react';

import { NotImplementedError } from '../lib/notImplemented';

import type { ThemeTokens } from './tokens';

/**
 * Provides the active theme, resolved from the OS appearance setting.
 *
 * Contract (src/__tests__/theme.test.tsx):
 * - With useColorScheme() returning 'dark', useTheme() yields darkTheme.
 * - With 'light', it yields lightTheme.
 * - The provider re-renders consumers when the scheme changes (live switch,
 *   US-011) — verified via mocked appearance in tests and manually on device.
 */

export interface ThemeProviderProps {
  children: ReactNode;
  /** Test seam: overrides useColorScheme(). Production never passes this. */
  schemeOverride?: 'dark' | 'light';
}

export function ThemeProvider(_props: ThemeProviderProps): ReactElement {
  throw new NotImplementedError('ThemeProvider');
}

export function useTheme(): ThemeTokens {
  throw new NotImplementedError('useTheme');
}
