# Play Store runbook — echoGalaxy TWA (Phase PS)

The exact sequence from this folder to an uploadable app bundle. The
`twa-manifest.json` here is the committed source of truth (PS-01
decisions baked in); Bubblewrap reads it directly.

## One-time setup (your machine, ~10 min + downloads)

```
npm i -g @bubblewrap/cli
bubblewrap doctor
```

`doctor` offers to download a JDK and the Android SDK on first run
(multi-GB — say yes, it manages them itself under ~/.bubblewrap).

## Build the bundle

From this `playstore/` directory:

```
bubblewrap update   # regenerates the Android project from twa-manifest.json
bubblewrap build    # produces app-release-bundle.aab (+ a test APK)
```

On the FIRST build it will offer to create `android.keystore` — accept,
choose a password, and **keep the keystore + password out of git and
backed up** (it is your upload key; `.gitignore` here already excludes
it). The AAB lands as `app-release-bundle.aab`.

## Test on a real device (optional but wise)

```
bubblewrap install   # sideloads the test APK onto a USB-connected phone
```

Until the assetlinks SHA-256 is live (see below), the app shows a
browser URL bar — that's the domain-verification handshake, not a bug.

## The domain handshake (after first Play Console upload)

1. Play Console → your app → Setup → **App integrity → App signing** —
   copy the **SHA-256 certificate fingerprint** (Play App Signing's
   key, not your upload key).
2. Paste it into `/.well-known/assetlinks.json` in the Aurelius site
   repo (placeholder is marked), commit, push, wait for Pages.
3. Reinstall/relaunch — the URL bar disappears. That's the TWA seal.

## Each later release

Bump `appVersionCode` (+1) and `appVersionName` in twa-manifest.json,
then `bubblewrap update && bubblewrap build`, upload the new AAB.
