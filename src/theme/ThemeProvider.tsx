import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from './tokens';

import type { ThemeTokens } from './tokens';

/**
 * Provides the active theme, resolved live from the OS appearance setting
 * (useColorScheme re-renders subscribers when the user toggles dark/light).
 * The context defaults to darkTheme — the primary design target — so
 * components render sensibly even outside a provider (e.g. in unit tests).
 */

const ThemeContext = createContext<ThemeTokens>(darkTheme);

export interface ThemeProviderProps {
  children: ReactNode;
  /** Test seam: overrides useColorScheme(). Production never passes this. */
  schemeOverride?: 'dark' | 'light';
}

export function ThemeProvider(props: ThemeProviderProps): ReactElement {
  const systemScheme = useColorScheme();
  const scheme = props.schemeOverride ?? systemScheme ?? 'dark';
  return (
    <ThemeContext.Provider value={scheme === 'light' ? lightTheme : darkTheme}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
