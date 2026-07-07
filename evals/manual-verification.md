# Manual verification checklist

Device/simulator checks for criteria that automated tests can only
approximate. Run the relevant section when its story lands; run everything
during /gate.

## OAuth end-to-end (US-002, US-003)

- [ ] Fresh install shows the setup screen; credentials save and survive an app restart
- [ ] "Connect to Oura" opens the real authorization page; approving lands back in the app logged in
- [ ] Sleep data loads from the live API with the granted scopes (confirms the scope list in `oauthConfig.ts` is sufficient — PRD open question)
- [ ] Revoke the app's access in the Oura dashboard → next refresh routes to the Connect screen with the factual logged-out message (no crash)

## Offline & cache (US-012)

- [ ] Open the app, let it sync, force-quit, enable Airplane Mode, reopen: last-synced data renders, stale indicator visible
- [ ] Disable Airplane Mode: data refreshes without user action

## Appearance (US-011)

- [ ] With the app open, switch iOS appearance dark ↔ light (Settings or simulator ⌘⇧A): app re-themes live, no restart
- [ ] Both modes pass the ui-oura-likeness screenshots

## Empty start (FR-12 — the "haven't worn it in months" case)

- [ ] A live account with no data in the last 90 days shows the factual
      empty state on Home, History, and Trends — no errors, no spinners stuck
- [ ] After wearing the ring one night, the app populates without reinstall

## Performance (success metrics)

- [ ] Cold open with warm cache → last night's score visible in under 2 s (stopwatch)
- [ ] Cold open, cache cleared, on Wi-Fi → under 5 s

## Token longevity (US-003 — long-running)

- [ ] Note the install date here: ____. After 30+ days of normal use, the app
      has never re-prompted for login (refresh rotation works in practice)
