/**
 * Design tokens — the only place colors are allowed to live
 * (src/__tests__/hardcodedColors.test.ts scans the rest of src/ for hex
 * literals). Dark is the primary design target, in the style of the official
 * Oura app: deep navy surfaces, teal/cyan accents. Light mode derives from
 * the same token names.
 *
 * Contract (src/__tests__/theme.test.tsx):
 * - darkTheme and lightTheme expose identical token keys with different
 *   background values.
 * - Score and stage colors are distinct within a theme.
 */

export interface ThemeTokens {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  scoreOptimal: string;
  scoreGood: string;
  scoreAttention: string;
  scoreNone: string;
  stageDeep: string;
  stageRem: string;
  stageLight: string;
  stageAwake: string;
  chartLine: string;
  divider: string;
}

// Placeholder values — the real palette is an implementation task (US-011).
const placeholder: ThemeTokens = {
  background: '',
  surface: '',
  textPrimary: '',
  textSecondary: '',
  accent: '',
  scoreOptimal: '',
  scoreGood: '',
  scoreAttention: '',
  scoreNone: '',
  stageDeep: '',
  stageRem: '',
  stageLight: '',
  stageAwake: '',
  chartLine: '',
  divider: '',
};

export const darkTheme: ThemeTokens = { ...placeholder };
export const lightTheme: ThemeTokens = { ...placeholder };
