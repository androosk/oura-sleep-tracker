# PRD: Oura Sleep Tracker (personal, no-nanny edition)

## Introduction

A personal iPhone app, built with React Native, that shows Oura Ring **sleep data only** — score, stages, overnight heart rate/HRV, and timing — pulled from the Oura API v2. It deliberately omits everything else the official app does: no readiness, no activity rings, and above all **no wellness messaging** ("It's going to be OK", insights, encouragement). Just the data, presented in a UI visually familiar to an Oura user.

The app is for personal use but will be open-sourced (shared on Reddit), so setup must not depend on the author's credentials: every user registers their own free Oura OAuth application and enters their own client ID/secret in the app.

**Key constraint discovered up front:** Oura deprecated Personal Access Tokens in December 2025. The API is OAuth2-only. This app uses the authorization-code flow with refresh tokens so login happens once.

## Goals

- Show last night's sleep in full detail: score + contributors, hypnogram + stage totals, overnight HR/HRV, timing & efficiency.
- Browse a history of past nights and tap into any night's detail.
- Show basic trends (sleep score and total sleep duration) over selectable periods.
- Log in once via OAuth; tokens refresh silently thereafter.
- Follow the system dark/light mode automatically (dark is the primary design target).
- Zero motivational/advisory copy anywhere in the app.
- Codebase readable by a developer who knows TypeScript/React but has never written Swift.

## User Stories

### US-001: Project scaffold

**Description:** As the developer, I want an Expo + TypeScript project with lint and test infrastructure so every later story has a place to land and a way to be verified.

**Acceptance Criteria:**

- [ ] Expo app (TypeScript template) runs on the iOS Simulator
- [ ] `tsconfig.json` has `strict: true`
- [ ] ESLint + Prettier configured; `npm run lint` passes
- [ ] Jest + React Native Testing Library configured; one trivial test passes via `npm test`
- [ ] Zod installed for boundary validation
- [ ] Git repo initialized with sensible `.gitignore`

### US-002: OAuth setup screen (bring-your-own credentials)

**Description:** As a user, I want to enter my own Oura OAuth client ID and secret on first launch so the open-source app never depends on anyone else's registration.

**Acceptance Criteria:**

- [ ] First launch shows a setup screen with fields for client ID and client secret, plus a short inline explanation of where to create an Oura OAuth app
- [ ] Credentials are stored in the iOS Keychain (expo-secure-store), never in plain AsyncStorage
- [ ] Validation: both fields required before continuing
- [ ] Typecheck/lint passes; unit test for the credential store module
- [ ] Verify on iOS Simulator (screenshot)

### US-003: OAuth login + token refresh

**Description:** As a user, I want to log in through Oura's web page once, and never think about auth again.

**Acceptance Criteria:**

- [ ] "Connect to Oura" launches Oura's authorization page (expo-auth-session / expo-web-browser) requesting the scopes needed for sleep + heart rate data
- [ ] Authorization code is exchanged for access + refresh tokens; both stored in Keychain
- [ ] API layer transparently refreshes an expired access token using the refresh token (single-use: the new refresh token replaces the old one atomically)
- [ ] A failed refresh (revoked/expired) routes the user back to the login screen with a plain, factual message
- [ ] Unit tests for the token-refresh state machine (mocked endpoints)
- [ ] Verify end-to-end on a real device or simulator with a live Oura account

### US-004: Typed API client with Zod validation

**Description:** As the developer, I want a small API client whose responses are validated at the boundary so bad data fails loudly at the edge, not deep in a chart component.

**Acceptance Criteria:**

- [ ] Zod schemas for `/v2/usercollection/daily_sleep` (score + contributors) and `/v2/usercollection/sleep` (sessions: stages, `sleep_phase_5_min`, HR/HRV samples, timing fields)
- [ ] Client functions: fetch daily sleep and sleep sessions for a date range, handling pagination (`next_token`)
- [ ] Non-sleep session types (e.g. naps) are fetched but distinguishable via the `type` field
- [ ] API errors (401, 429, network) surface as typed errors, not exceptions swallowed in components
- [ ] Unit tests with recorded/fixture JSON responses; typecheck/lint passes

### US-005: Last-night screen — score + contributors

**Description:** As a user, I want to open the app and immediately see last night's sleep score and what drove it, like the Oura sleep tab.

**Acceptance Criteria:**

- [ ] Home screen shows the most recent night: large score ring (0–100) with the score centered
- [ ] Contributor list below (efficiency, restfulness, REM, deep sleep, latency, timing) with per-contributor bars/values
- [ ] Score color-coding matches Oura convention (85+ optimal, 70–84 good, <70 pay attention)
- [ ] Loading and "no data yet for last night" states are plain and factual
- [ ] Typecheck/lint passes; verify on iOS Simulator (screenshot)

### US-006: Night detail — hypnogram + stage totals

**Description:** As a user, I want to see the stage timeline for a night and how long I spent in each stage.

**Acceptance Criteria:**

- [ ] Hypnogram rendered from `sleep_phase_5_min` (deep / light / REM / awake), visually consistent with Oura's stage chart
- [ ] Totals row: time asleep, deep, REM, light, awake — durations formatted as `7h 32m`
- [ ] X-axis labeled with bedtime → wake time (local time)
- [ ] Typecheck/lint passes; unit test for the phase-string parser; verify on iOS Simulator (screenshot)

### US-007: Night detail — overnight heart rate & HRV

**Description:** As a user, I want the overnight HR and HRV curves with the summary numbers.

**Acceptance Criteria:**

- [ ] Line charts of the 5-minute HR and HRV samples across the night; gaps in samples render as gaps, not interpolated lies
- [ ] Summary values shown: lowest HR, average HR, average HRV
- [ ] Typecheck/lint passes; verify on iOS Simulator (screenshot)

### US-008: Night detail — timing & efficiency

**Description:** As a user, I want the timing facts for a night: when I went to bed, when I got up, and how efficient the sleep was.

**Acceptance Criteria:**

- [ ] Shows bedtime, wake time, time in bed, time asleep, sleep efficiency (%), and latency
- [ ] All times rendered in the phone's local timezone
- [ ] Typecheck/lint passes; verify on iOS Simulator (screenshot)

### US-009: History list

**Description:** As a user, I want to scroll back through past nights and open any of them.

**Acceptance Criteria:**

- [ ] Chronological list (most recent first): date, score with color dot, total sleep duration per row
- [ ] Tapping a row opens the full night detail (US-005–US-008 layout for that night)
- [ ] Infinite scroll / incremental loading for older data via API pagination
- [ ] Nights with no data (ring not worn) appear as gaps, not errors
- [ ] Typecheck/lint passes; verify on iOS Simulator (screenshot)

### US-010: Trends

**Description:** As a user, I want to see how sleep score and duration move over time.

**Acceptance Criteria:**

- [ ] Trends screen with period selector: 2 weeks / 1 month / 3 months
- [ ] Bar or line charts for sleep score and total sleep duration over the selected period
- [ ] Average for the period displayed as a plain number (no commentary)
- [ ] Typecheck/lint passes; verify on iOS Simulator (screenshot)

### US-011: Theming — Oura-like, system dark/light

**Description:** As a user, I want the app to look like the Oura app I'm used to and follow my phone's appearance setting.

**Acceptance Criteria:**

- [ ] Central theme module (colors, typography, spacing) consumed by all screens — no hardcoded colors in components
- [ ] Dark theme: deep navy/near-black backgrounds, card surfaces, teal/cyan accents in the Oura style; light theme derived from the same tokens
- [ ] Switching iOS appearance (Settings or simulator toggle) updates the app live via `useColorScheme`
- [ ] Typecheck/lint passes; verify both modes on iOS Simulator (screenshots)

### US-012: Offline cache

**Description:** As a user, I want the app to open instantly with the last-fetched data and work on the subway.

**Acceptance Criteria:**

- [ ] Fetched sleep data is cached locally; app renders cached data immediately, then refreshes in the background
- [ ] Airplane mode: previously viewed data still displays; a quiet indicator shows data may be stale
- [ ] Typecheck/lint passes; verify by toggling network on simulator/device

### US-013: Open-source README

**Description:** As a Reddit user who found this repo, I want to go from clone to app-on-my-phone without asking questions.

**Acceptance Criteria:**

- [ ] README covers: creating an Oura OAuth application (with the redirect URI to enter), prerequisites (Node, Expo account, Apple Developer account), EAS build/submit steps (with a local `npx expo run:ios` alternative for non-EAS users), and screenshots
- [ ] LICENSE file (MIT unless the author decides otherwise)
- [ ] A stranger-facing "what this is / what this deliberately isn't" section (no readiness, no advice)

### US-014: Resting HR & HRV trends (later addition — build after US-001–US-013 ship)

**Description:** As a user, I want to see my overnight resting heart rate and HRV averages trend over time alongside the sleep trends.

**Acceptance Criteria:**

- [ ] Trends screen gains lowest/average overnight HR and average HRV charts over the same 2-week / 1-month / 3-month periods
- [ ] Period average shown as a plain number, no commentary
- [ ] Typecheck/lint passes; verify on iOS Simulator (screenshot)

## Functional Requirements

- FR-1: Authenticate with the Oura API v2 via OAuth2 authorization-code flow with refresh tokens; tokens and OAuth client credentials stored in iOS Keychain.
- FR-2: On first launch, collect the user's own Oura OAuth client ID/secret; never ship or hardcode credentials in the repo.
- FR-3: Fetch and validate (Zod) daily sleep summaries and detailed sleep sessions for arbitrary date ranges, following API pagination.
- FR-4: Home screen shows the most recent night: score ring, contributors, hypnogram, stage totals, HR/HRV charts, timing & efficiency.
- FR-5: History list of past nights with score and duration; each row opens that night's full detail.
- FR-6: Trends screen: sleep score and total sleep duration charts over 2-week / 1-month / 3-month periods.
- FR-7: All UI copy is descriptive and factual. No recommendations, encouragement, insights, or sentiment anywhere — including empty/error states.
- FR-8: Theme follows the iOS system appearance (dark/light) live, from a single token source.
- FR-9: Data is cached locally; the app is readable offline with the last-synced data.
- FR-10: A 401 that survives a token refresh attempt logs the user out to the login screen; a 429 backs off and retries rather than erroring the UI.
- FR-11: Initial sync covers the last 90 days; older history is lazily backfilled as the user scrolls past the synced window.
- FR-12: A completely empty sync window (no sleep data at all — e.g. the ring hasn't been worn in months) is a first-class state: every screen renders a plain, factual empty state, and the app populates normally once new nights arrive.

## Non-Goals (Out of Scope)

- No readiness, activity, workouts, stress, SpO2, temperature, cycle tracking — sleep only.
- No wellness advice, insights, coaching copy, streaks, or notifications of any kind.
- No Android support (code shouldn't gratuitously block it, but it is never tested).
- No public App Store listing — personal installs via EAS Build → TestFlight/Apple with a paid developer account.
- No Apple Health integration.
- No backend server — the phone talks directly to the Oura API.
- Naps are not displayed in v1 (data model keeps them distinguishable for later).
- No home-screen widgets or watch app in v1.

## Design Considerations

- Visual reference is the official Oura app's **sleep tab**: dark navy/near-black background, elevated card surfaces, thin ring gauge for the score, stage-colored hypnogram, understated sans-serif type.
- Score colors follow Oura convention: optimal (85+) teal/blue, good (70–84) neutral, pay-attention (<70) muted red/orange — used as data color only, never with judgmental copy.
- Dark mode is the primary design target; light mode derives from the same tokens and just needs to be non-broken and legible.
- Charts (score ring, hypnogram, HR/HRV lines, trend bars) built as custom components on `react-native-svg` — more readable/ownable than a charting library, and the hypnogram is custom anyway.

## Technical Considerations

- **Stack:** Expo (React Native, TypeScript strict), expo-auth-session + expo-web-browser for OAuth, expo-secure-store for Keychain, react-native-svg for charts, TanStack Query for fetch/cache/refresh orchestration, AsyncStorage as the offline cache persistence layer. Each dependency is the community-standard for its job; no overlapping additions.
- **Oura API v2:** `GET /v2/usercollection/daily_sleep` (score, contributors), `GET /v2/usercollection/sleep` (sessions: `sleep_phase_5_min` hypnogram string, 5-min HR/HRV samples, durations, efficiency, latency, bed/wake timestamps, `type` for long_sleep vs. nap). Both paginate via `next_token`.
- **OAuth:** authorize at `cloud.ouraring.com/oauth/authorize`, token exchange at `api.ouraring.com/oauth/token`. Refresh tokens are single-use — the refresh routine must persist the replacement token before retrying the original request. The user registers a redirect URI (custom scheme, e.g. `ourasleep://callback`) in their Oura OAuth app.
- **Auth security note:** the client secret living on-device is an accepted tradeoff for a personal app where each user owns their own OAuth registration; the README must state this plainly. Secrets never appear in the repo, logs, or error messages. Per global rules, the auth code gets a security pass (/vibe-security) before it's called done.
- **Distribution:** EAS Build → submit to Apple (the author's standard flow; keeps the native `ios/` directory out of git). Local `npx expo run:ios` remains a documented alternative for strangers who avoid EAS. Expo Go covers simulator development.
- **Timezones:** Oura timestamps carry offsets; all display is converted to the device's local timezone. This is a classic bug farm — the contract should pin fixture-based tests here.

## Success Metrics

- Cold open to seeing last night's score: under 2 seconds with cache, under 5 without.
- Zero instances of advisory/motivational copy (grep-able: the contract can assert a banned-phrase list against the string catalog).
- Login survives 30+ days without re-prompting (refresh flow works).
- A stranger can go from `git clone` to app on phone using only the README.

## Open Questions

- **Exact OAuth scopes:** docs say `daily` covers sleep summaries; confirm whether detailed sleep sessions and overnight HR samples need `heartrate`/`session` scopes too. Resolve during /contract by inspecting the API responses.
- Does Oura's OAuth app registration accept custom-scheme redirect URIs (needed for mobile)? If not, fallback is a localhost/https redirect variant — verify while setting up the OAuth app.

## Resolved Questions

- History sync: **last 90 days with lazy backfill** (FR-11). Decided 2026-07-06.
- Resting HR / HRV trends: **yes, as post-v1 story US-014**. Decided 2026-07-06.
