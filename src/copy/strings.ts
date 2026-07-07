/**
 * The complete catalog of user-facing copy. Screens must render strings from
 * here, never inline literals, so the no-nanny rule (FR-7) stays enforceable.
 * Tone contract: descriptive and factual only — no advice, reassurance,
 * praise, or nudging. See src/__tests__/copy.test.ts and evals/copy-tone.md.
 */

export const strings = {
  home: {
    loading: 'Loading sleep data…',
    emptyWindow:
      'No sleep data in the last 90 days. Data appears here after a night of wearing the ring.',
    noDataLastNight: 'No sleep data recorded for last night.',
  },
  history: {
    title: 'History',
    empty: 'No nights synced yet.',
  },
  trends: {
    title: 'Trends',
    averageScoreLabel: 'Average score',
    averageDurationLabel: 'Average sleep duration',
  },
  setup: {
    title: 'Oura API credentials',
    explanation:
      'This app talks to the Oura API with your own API application. Create one at developer.ouraring.com/applications, set its redirect URI to ourasleep://callback, and enter its client ID and secret below. Both are stored in the iOS Keychain on this device only.',
    clientIdLabel: 'Client ID',
    clientSecretLabel: 'Client secret',
    saveButton: 'Save',
  },
  connect: {
    title: 'Connect to Oura',
    button: 'Log in with Oura',
    devRedirectLabel:
      'Development redirect URI — register this in your Oura application while testing in Expo Go:',
  },
  errors: {
    loggedOut: 'The Oura session expired. Log in again to resume syncing.',
    network: 'The Oura API could not be reached.',
    staleData: 'Offline. Showing data from the last sync.',
  },
} as const;
