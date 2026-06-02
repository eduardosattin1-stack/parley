package tech.carbonbridge.meetlog;

import android.Manifest;
import android.media.MediaRecorder;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileInputStream;
import java.io.ByteArrayOutputStream;

/**
 * Far-field audio recorder.
 *
 * Records with Android's UNPROCESSED audio source (falling back to
 * VOICE_RECOGNITION, then MIC) to bypass the telephony AGC / noise-gate /
 * echo-cancellation that the WebView's MediaRecorder forces on. That DSP is
 * tuned for a single close talker and gates out distant speakers — exactly the
 * open-room / multi-speaker case Parley cares about.
 *
 * Output is AAC in an .m4a container, returned as base64 so the existing
 * web analyze pipeline can treat it like any imported file.
 */
@CapacitorPlugin(
    name = "FarFieldRecorder",
    permissions = {
        @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
    }
)
public class FarFieldRecorder extends Plugin {

    private MediaRecorder recorder;
    private String outputPath;
    private boolean isRecording = false;
    private String activeSource = "unknown";

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void startRecording(PluginCall call) {
        if (getPermissionState("microphone") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "startAfterPermission");
            return;
        }
        startInternal(call);
    }

    @PermissionCallback
    private void startAfterPermission(PluginCall call) {
        if (getPermissionState("microphone") == com.getcapacitor.PermissionState.GRANTED) {
            startInternal(call);
        } else {
            call.reject("Microphone permission denied.");
        }
    }

    private void startInternal(PluginCall call) {
        if (isRecording) {
            call.reject("Already recording.");
            return;
        }
        try {
            File out = new File(getContext().getCacheDir(), "parley_farfield_" + System.currentTimeMillis() + ".m4a");
            outputPath = out.getAbsolutePath();

            recorder = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
                ? new MediaRecorder(getContext())
                : new MediaRecorder();

            // Prefer the rawest source available so distant voices aren't gated.
            int source;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                source = MediaRecorder.AudioSource.UNPROCESSED;
                activeSource = "UNPROCESSED";
            } else {
                source = MediaRecorder.AudioSource.VOICE_RECOGNITION;
                activeSource = "VOICE_RECOGNITION";
            }

            try {
                recorder.setAudioSource(source);
            } catch (Exception e) {
                // Some devices don't expose UNPROCESSED — fall back.
                recorder.setAudioSource(MediaRecorder.AudioSource.VOICE_RECOGNITION);
                activeSource = "VOICE_RECOGNITION";
            }

            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setAudioSamplingRate(48000);
            recorder.setAudioEncodingBitRate(96000);
            recorder.setAudioChannels(1);
            recorder.setOutputFile(outputPath);

            recorder.prepare();
            recorder.start();
            isRecording = true;

            JSObject ret = new JSObject();
            ret.put("started", true);
            ret.put("source", activeSource);
            call.resolve(ret);
        } catch (Exception e) {
            cleanup();
            call.reject("Failed to start far-field recording: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopRecording(PluginCall call) {
        if (!isRecording || recorder == null) {
            call.reject("Not recording.");
            return;
        }
        try {
            recorder.stop();
        } catch (Exception e) {
            // stop() throws if no frames were captured; treat as empty.
            cleanup();
            call.reject("Recording stopped with no audio: " + e.getMessage());
            return;
        }
        cleanup();

        try {
            File f = new File(outputPath);
            FileInputStream fis = new FileInputStream(f);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = fis.read(buf)) != -1) bos.write(buf, 0, n);
            fis.close();
            String b64 = Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
            long size = f.length();
            f.delete();

            JSObject ret = new JSObject();
            ret.put("base64", b64);
            ret.put("mimeType", "audio/mp4");
            ret.put("size", size);
            ret.put("source", activeSource);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to read recording: " + e.getMessage());
        }
    }

    private void cleanup() {
        isRecording = false;
        if (recorder != null) {
            try { recorder.reset(); } catch (Exception ignored) {}
            try { recorder.release(); } catch (Exception ignored) {}
            recorder = null;
        }
    }
}
