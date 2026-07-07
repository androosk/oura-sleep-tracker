/**
 * Design tokens — the only place colors are allowed to live
 * (src/__tests__/hardcodedColors.test.ts scans the rest of src/ for hex
 * literals). Dark is the primary design target, in the style of the official
 * Oura app: deep navy surfaces, teal/cyan accents. Light mode derives from
 * the same token names.
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

export const darkTheme: ThemeTokens = {
  background: '#0C1420',
  surface: '#16202E',
  textPrimary: '#ECF1F7',
  textSecondary: '#8A98A8',
  accent: '#5AC8D8',
  scoreOptimal: '#4FD8C4',
  scoreGood: '#A9BED6',
  scoreAttention: '#E08A6D',
  scoreNone: '#5A6675',
  stageDeep: '#2E5D9F',
  stageRem: '#9BC4F5',
  stageLight: '#5B8FD9',
  stageAwake: '#C8D6E8',
  chartLine: '#5AC8D8',
  divider: '#243244',
};

export const lightTheme: ThemeTokens = {
  background: '#F4F6F9',
  surface: '#FFFFFF',
  textPrimary: '#1A2635',
  textSecondary: '#5C6B7C',
  accent: '#0E8A9C',
  scoreOptimal: '#0FA98F',
  scoreGood: '#4A6FA5',
  scoreAttention: '#C4633F',
  scoreNone: '#9AA7B5',
  stageDeep: '#1F4E8C',
  stageRem: '#8FB4E8',
  stageLight: '#4A7EC2',
  stageAwake: '#A8B9CE',
  chartLine: '#0E8A9C',
  divider: '#DCE3EC',
};
