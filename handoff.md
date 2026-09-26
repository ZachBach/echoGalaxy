# Helix Android Integration — Claude Handoff

## Goal

Finish the in-progress Helix voice assistant integration in EchoGalaxy. The
target is the Capacitor Android app, not the separate React Native Helix repo.
Helix should support local voice controls, spoken astronomy Q&A through a
provider-neutral server endpoint, and Android text-to-speech. Microphone audio
must remain on-device; only recognized text and scene context may be sent to
the Q&A server.

## Current implementation

- `src/helix/actions.js`: allowlisted local commands and server action validation.
- `src/helix/client.js`: HTTPS-only-by-default `POST /v1/assistant/chat` client.
- `src/helix/HelixAssistant.jsx`: assistant panel, native events, wake-word,
  on-device transcription, Q&A, and spoken responses.
- `android/app/src/main/java/com/echogalaxy/app/HelixPlugin.java`: initial
  Capacitor plugin for Porcupine, Android on-device speech recognition, and TTS.
- `MainActivity.java`: registers the plugin.
- Android manifest and Gradle files: microphone permission, speech-service
  visibility, Porcupine dependency, and local AccessKey injection.
- `App.jsx` and `index.css`: assistant UI and app navigation/action wiring.
- `tests/helix.test.mjs`, `package.json`: Node test coverage and `npm test`.
- `README.md`: setup, privacy behavior, endpoint, and build instructions.
- `.gitignore`: excludes the local `.ppn` keyword model.

Local voice navigation supports scale changes, cycling the current list/system,
and the cluster redshift toggle. Remote responses may contain only validated
app actions. The Android plugin uses `SpeechRecognizer.createOnDeviceSpeechRecognizer`;
it intentionally has no network-recognition fallback and pauses its wake listener
when the app backgrounds.

## Validation already completed

- `npm test`: passed, 5 tests.
- `npm run build`: passed. Vite reports the existing large-chunk warning.
- `npx cap sync android`: passed.
- Android `.\gradlew.bat assembleDebug`: did not reach compilation; Gradle failed
  with `Unsupported class file major version 69`, indicating the active Java
  runtime is too new for the wrapper/Groovy build setup. Retry with a supported
  JDK (Android Gradle Plugin 8.9 expects JDK 17), then fix any actual compile
  errors.
- `npm run check:mobile`: initial layout metrics passed for iPhone SE (45% HUD),
  Galaxy S8 (44%), and Android small (46%), but the check exited 1 because
  Chrome never exposed a page target. This is an environment/browser startup
  failure, not a reported layout assertion failure; retry when Chrome is
  available to the harness.
- No Helix changes have been committed or pushed.

## Required local setup (do not commit credentials/models)

1. Add `PICOVOICE_ACCESS_KEY=...` to `android/local.properties`, preserving its
   existing `sdk.dir` setting.
2. Add the generated Android keyword model as
   `android/app/src/main/assets/helix_android.ppn` (already Git-ignored).
3. Set `VITE_HELIX_API_URL=https://...` in the ignored root `.env.local` to enable
   remote Q&A. No Q&A server implementation or endpoint has been supplied yet.
4. The app must show clear setup/device errors when these are absent. Never put
   the Picovoice key in a `VITE_` variable or commit it.

## Next work

1. Preserve the pre-existing user changes in `.claude/settings.json` and
   `src/App.jsx`; do not reset or overwrite unrelated edits.
2. Run the mobile check again and compile Android with JDK 17.
3. Review/fix Java plugin lifecycle and threading issues found by compilation or
   testing; verify permission denial, missing model/key, background/foreground,
   transcription errors, and TTS completion.
4. Inspect the Android diff for files created by `cap sync`; keep generated
   changes only if required.
5. Re-run `npm test`, `npm run build`, `npm run check:mobile`, and
   `.\gradlew.bat assembleDebug`.
6. Report that live wake-word/Q&A behavior still requires the user's local
   Picovoice model/key and a compatible HTTPS assistant endpoint. Do not commit
   or push unless explicitly requested.
