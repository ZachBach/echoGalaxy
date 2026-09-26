package com.echogalaxy.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

import ai.picovoice.porcupine.PorcupineException;
import ai.picovoice.porcupine.PorcupineManager;

@CapacitorPlugin(
    name = "Helix",
    permissions = {
        @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
    }
)
public class HelixPlugin extends Plugin {
    private static final String KEYWORD_MODEL = "helix_android.ppn";

    private PorcupineManager porcupineManager;
    private SpeechRecognizer speechRecognizer;
    private TextToSpeech textToSpeech;
    private boolean wakeWordDesired;
    private boolean resumeWakeWordOnResume;
    private boolean recognitionActive;
    private boolean textToSpeechReady;
    private boolean textToSpeechInitializing;
    private String pendingSpeechText;
    private String activeUtteranceId;

    @PluginMethod
    public void startWakeWord(PluginCall call) {
        if (!hasMicrophonePermission()) {
            requestPermissionForAlias("microphone", call, "startWakeWordAfterPermission");
            return;
        }
        startWakeWordWithPermission(call);
    }

    @PermissionCallback
    private void startWakeWordAfterPermission(PluginCall call) {
        if (!hasMicrophonePermission()) {
            call.reject("Microphone permission is required to listen for Helix.");
            return;
        }
        startWakeWordWithPermission(call);
    }

    private void startWakeWordWithPermission(PluginCall call) {
        if (porcupineManager != null) {
            resolveStatus(call, "listening");
            return;
        }

        String accessKey = BuildConfig.HELIX_PICOVOICE_ACCESS_KEY;
        if (accessKey.trim().isEmpty()) {
            reject(call, "Add PICOVOICE_ACCESS_KEY to android/local.properties before starting Helix.");
            return;
        }

        try (InputStream ignored = getContext().getAssets().open(KEYWORD_MODEL)) {
            // Opening the asset here gives a clear setup error before the SDK initializes.
        } catch (IOException e) {
            reject(call, "Missing " + KEYWORD_MODEL + " in android/app/src/main/assets.");
            return;
        }

        try {
            porcupineManager = new PorcupineManager.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(KEYWORD_MODEL)
                .setSensitivity(0.55f)
                .setErrorCallback(error -> emitError(error.getMessage()))
                .build(
                    getContext().getApplicationContext(),
                    keywordIndex -> runOnUiThread(() -> onWakeWordDetected(keywordIndex))
                );
            porcupineManager.start();
            wakeWordDesired = true;
            emitState("listening");
            resolveStatus(call, "listening");
        } catch (PorcupineException | IllegalStateException e) {
            stopWakeWordManager(true);
            reject(call, "Could not start Helix wake-word detection: " + e.getMessage());
        }
    }

    private void onWakeWordDetected(int keywordIndex) {
        stopWakeWordManager(false);
        emitState("transcribing");
        JSObject event = new JSObject();
        event.put("keywordIndex", keywordIndex);
        notifyListeners("wakeWordDetected", event);
    }

    @PluginMethod
    public void stopWakeWord(PluginCall call) {
        stopWakeWordManager(true);
        emitState("idle");
        resolveStatus(call, "idle");
    }

    @PluginMethod
    public void startSpeechRecognition(PluginCall call) {
        if (!hasMicrophonePermission()) {
            requestPermissionForAlias("microphone", call, "startSpeechAfterPermission");
            return;
        }
        startSpeechWithPermission(call);
    }

    @PermissionCallback
    private void startSpeechAfterPermission(PluginCall call) {
        if (!hasMicrophonePermission()) {
            call.reject("Microphone permission is required to ask Helix a question.");
            return;
        }
        startSpeechWithPermission(call);
    }

    private void startSpeechWithPermission(PluginCall call) {
        stopWakeWordManager(false);
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            reject(call, "On-device speech recognition requires Android 12 or later.");
            return;
        }
        if (!SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
            reject(call, "This device does not have an on-device speech recognition service.");
            return;
        }
        if (recognitionActive) {
            reject(call, "Helix is already listening to a question.");
            return;
        }

        try {
            speechRecognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    emitState("hearing");
                }

                @Override
                public void onBeginningOfSpeech() {}

                @Override
                public void onRmsChanged(float rmsdB) {}

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {
                    emitState("processing");
                }

                @Override
                public void onError(int error) {
                    if (!recognitionActive) return;
                    finishRecognition();
                    emitError(speechErrorMessage(error));
                }

                @Override
                public void onResults(Bundle results) {
                    if (!recognitionActive) return;
                    ArrayList<String> matches =
                        results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    finishRecognition();
                    if (matches == null || matches.isEmpty() || matches.get(0).trim().isEmpty()) {
                        emitError("No speech was recognized. Please try again.");
                        return;
                    }
                    JSObject event = new JSObject();
                    event.put("text", matches.get(0).trim());
                    notifyListeners("transcript", event);
                    emitState("processing");
                }

                @Override
                public void onPartialResults(Bundle partialResults) {}

                @Override
                public void onEvent(int eventType, Bundle params) {}
            });

            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            );
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag());
            intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);

            recognitionActive = true;
            speechRecognizer.startListening(intent);
            emitState("hearing");
            resolveStatus(call, "hearing");
        } catch (IllegalStateException | SecurityException e) {
            finishRecognition();
            reject(call, "Could not start on-device speech recognition: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopSpeechRecognition(PluginCall call) {
        finishRecognition();
        emitState("idle");
        resolveStatus(call, "idle");
    }

    private void finishRecognition() {
        recognitionActive = false;
        SpeechRecognizer current = speechRecognizer;
        speechRecognizer = null;
        if (current != null) {
            current.cancel();
            current.destroy();
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text");
        if (text == null || text.trim().isEmpty()) {
            call.reject("Text is required for speech output.");
            return;
        }
        if (textToSpeechInitializing && pendingSpeechText != null) {
            call.reject("Helix is already preparing speech output.");
            return;
        }

        if (textToSpeechReady) {
            speakNow(text);
        } else {
            pendingSpeechText = text;
            if (!textToSpeechInitializing) initializeTextToSpeech();
        }
        resolveStatus(call, "queued");
    }

    private void initializeTextToSpeech() {
        textToSpeechInitializing = true;
        textToSpeech = new TextToSpeech(
            getContext().getApplicationContext(),
            status -> runOnUiThread(() -> onTextToSpeechInitialized(status))
        );
    }

    private void onTextToSpeechInitialized(int status) {
        textToSpeechInitializing = false;
        if (status != TextToSpeech.SUCCESS || textToSpeech == null) {
            pendingSpeechText = null;
            emitError("Android text-to-speech could not initialize.");
            return;
        }

        int languageStatus = textToSpeech.setLanguage(Locale.getDefault());
        if (
            languageStatus == TextToSpeech.LANG_MISSING_DATA ||
            languageStatus == TextToSpeech.LANG_NOT_SUPPORTED
        ) {
            pendingSpeechText = null;
            emitError("No installed text-to-speech voice supports the device language.");
            return;
        }

        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {}

            @Override
            public void onDone(String utteranceId) {
                runOnUiThread(() -> {
                    if (utteranceId.equals(activeUtteranceId)) {
                        activeUtteranceId = null;
                        notifyListeners("speechFinished", new JSObject());
                    }
                });
            }

            @Override
            public void onError(String utteranceId) {
                runOnUiThread(() -> emitError("Android text-to-speech failed."));
            }
        });

        textToSpeechReady = true;
        String queued = pendingSpeechText;
        pendingSpeechText = null;
        if (queued != null) speakNow(queued);
    }

    private void speakNow(String text) {
        if (textToSpeech == null || !textToSpeechReady) {
            emitError("Android text-to-speech is not ready.");
            return;
        }
        String utteranceId = UUID.randomUUID().toString();
        activeUtteranceId = utteranceId;
        int result = textToSpeech.speak(
            text,
            TextToSpeech.QUEUE_FLUSH,
            null,
            utteranceId
        );
        if (result == TextToSpeech.ERROR) {
            activeUtteranceId = null;
            emitError("Android text-to-speech rejected the response.");
        }
    }

    private boolean hasMicrophonePermission() {
        return ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED;
    }

    private void stopWakeWordManager(boolean clearDesired) {
        if (clearDesired) wakeWordDesired = false;
        PorcupineManager current = porcupineManager;
        porcupineManager = null;
        if (current == null) return;
        try {
            current.stop();
        } catch (PorcupineException e) {
            emitError("Could not stop Helix wake-word detection: " + e.getMessage());
        }
        current.delete();
    }

    private String speechErrorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "The microphone could not provide audio.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Microphone permission is required to ask Helix a question.";
            case SpeechRecognizer.ERROR_NO_MATCH:
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "No speech was recognized. Please try again.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "The on-device speech recognizer is busy. Try again shortly.";
            default:
                return "On-device speech recognition failed (error " + error + ").";
        }
    }

    private void resolveStatus(PluginCall call, String status) {
        if (call == null) return;
        JSObject result = new JSObject();
        result.put("status", status);
        call.resolve(result);
    }

    private void reject(PluginCall call, String message) {
        emitError(message);
        if (call != null) call.reject(message);
    }

    private void emitState(String status) {
        JSObject event = new JSObject();
        event.put("status", status);
        notifyListeners("state", event);
    }

    private void emitError(String message) {
        JSObject event = new JSObject();
        event.put("message", message == null || message.isEmpty() ? "Helix encountered an error." : message);
        notifyListeners("voiceError", event);
        emitState("error");
    }

    private void runOnUiThread(Runnable task) {
        AppCompatActivity activity = getActivity();
        if (activity != null) activity.runOnUiThread(task);
    }

    @Override
    protected void handleOnPause() {
        resumeWakeWordOnResume = wakeWordDesired;
        finishRecognition();
        stopWakeWordManager(false);
        emitState("paused");
    }

    @Override
    protected void handleOnResume() {
        if (!resumeWakeWordOnResume) return;
        resumeWakeWordOnResume = false;
        if (!hasMicrophonePermission()) {
            emitError("Microphone permission is required to resume Helix.");
            return;
        }
        startWakeWordWithPermission(null);
    }

    @Override
    protected void handleOnDestroy() {
        wakeWordDesired = false;
        resumeWakeWordOnResume = false;
        finishRecognition();
        stopWakeWordManager(true);
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        textToSpeechReady = false;
        textToSpeechInitializing = false;
        pendingSpeechText = null;
    }
}
