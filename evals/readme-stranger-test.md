# Eval: README stranger test (US-013)

The README passes when a stranger with an Oura ring and a Mac can go from
`git clone` to the app on their phone without asking a question.

## Checklist

- [ ] Prerequisites listed with versions: Node, Expo account (for EAS), Apple Developer account (paid vs free tradeoff stated: free = 7-day reinstall cycle on local builds)
- [ ] Step-by-step Oura OAuth app registration: where (developer.ouraring.com/applications), which redirect URI to enter, which scopes
- [ ] Covers the portal's required TOS / privacy policy / web app URL fields (point them at this repo's TERMS.md, PRIVACY.md, and repo URL — or your fork's)
- [ ] Explains that credentials are entered in-app on first launch and stored in the Keychain
- [ ] States plainly that the client secret lives on your own device and why that's acceptable for a personal app you registered yourself
- [ ] Install/run steps are copy-pasteable and in order: `npm install`, then EAS build/submit (primary) or `npx expo run:ios --device` (local alternative)
- [ ] Screenshots of the main screens (dark mode)
- [ ] "What this is / what this deliberately isn't" section: sleep only, no readiness/activity, no advice, no notifications
- [ ] License stated

## Procedure

Give the README (not the repo tour) to someone unfamiliar with the project —
or run it yourself in a clean directory following ONLY written steps.
Every place you had to improvise is a FAIL item to fix.

## Pass/fail anchors

- **PASS**: zero improvised steps; the checklist is fully checked.
- **FAIL**: any step requires knowledge not in the README.
