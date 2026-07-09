# Privacy Policy

This is a personal, open-source iPhone app. Each user registers their own
Oura API application and runs the app under their own credentials.

**Data flow.** The app talks directly from your phone to the Oura API
(`api.ouraring.com`). There is no server operated by this project. Your sleep
data never passes through, and is never stored on, any system other than your
own device and Oura's own services.

**What is stored on your device.**

- Your Oura API application's client ID and secret, and your OAuth tokens —
  in the iOS Keychain.
- A local cache of your sleep data, so the app works offline — stored as
  AES-256-GCM ciphertext in the app's private storage, with the encryption
  key in the iOS Keychain.

**What this app collects, transmits, or sells: nothing.** No analytics, no
telemetry, no ads, no third-party SDKs that phone home.

**Removal.** Deleting the app deletes the cached sleep data. iOS may retain
Keychain entries (your API credentials and tokens) after an uninstall — to
fully sever access, also revoke the application in your Oura account
settings, which invalidates the tokens regardless of what the Keychain
holds.

Oura's own [privacy policy](https://ouraring.com/privacy-policy) governs the
data Oura itself holds.
