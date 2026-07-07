/**
 * The complete catalog of user-facing copy. Screens must render strings from
 * here, never inline literals, so the no-nanny rule (FR-7) stays enforceable.
 *
 * Contract (src/__tests__/copy.test.ts):
 * - Every leaf is non-empty.
 * - No string matches the banned-phrase list (motivational/advisory tone),
 *   contains an exclamation mark, or contains emoji.
 * - Tone must be descriptive and factual; see evals/copy-tone.md for the
 *   judgment-based half of this contract.
 */

export const strings = {
  home: {
    loading: '',
    emptyWindow: '',
    noDataLastNight: '',
  },
  history: {
    title: '',
    empty: '',
  },
  trends: {
    title: '',
    averageScoreLabel: '',
    averageDurationLabel: '',
  },
  setup: {
    title: '',
    explanation: '',
    clientIdLabel: '',
    clientSecretLabel: '',
    saveButton: '',
  },
  connect: {
    title: '',
    button: '',
  },
  errors: {
    loggedOut: '',
    network: '',
    staleData: '',
  },
} as const;
