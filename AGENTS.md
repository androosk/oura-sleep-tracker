# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Dev loop

- After Metro restarts or an HMR graph error ("Got unexpected undefined" in
  DeltaBundler), Expo Go can resurrect a stale cached bundle with no dev-server
  connection — your edits run nowhere. Reset: kill Metro,
  `xcrun simctl terminate booted host.exp.Exponent`, fresh `npx expo start --ios`,
  then confirm an "iOS Bundled … (1000+ modules)" line before trusting behavior.
  Never uninstall Expo Go — it wipes the Keychain (OAuth credentials and tokens).
- Screenshots from a logged-in session contain real health data. Never commit
  them; regenerate against the sandbox (any bearer token works) for README/PR
  images.
