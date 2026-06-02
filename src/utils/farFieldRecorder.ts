/**
 * JS bridge to the native FarFieldRecorder Capacitor plugin (Android).
 *
 * Records with Android's UNPROCESSED audio source to bypass the WebView
 * MediaRecorder's AGC/noise-gate that gates out distant speakers. Only available
 * on the native Android build; callers should feature-detect via isFarFieldAvailable().
 */
import { registerPlugin, Capacitor } from "@capacitor/core";

export interface FarFieldRecorderPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  startRecording(): Promise<{ started: boolean; source: string }>;
  stopRecording(): Promise<{ base64: string; mimeType: string; size: number; source: string }>;
}

const FarFieldRecorder = registerPlugin<FarFieldRecorderPlugin>("FarFieldRecorder");

/** True only on the native Android build where the plugin is registered. */
export async function isFarFieldAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const r = await FarFieldRecorder.isAvailable();
    return !!r.available;
  } catch {
    return false;
  }
}

export async function startFarFieldRecording(): Promise<{ source: string }> {
  const r = await FarFieldRecorder.startRecording();
  return { source: r.source };
}

/** Stop and return the recording as a Blob (m4a/AAC) plus its detected source. */
export async function stopFarFieldRecording(): Promise<{ blob: Blob; source: string }> {
  const r = await FarFieldRecorder.stopRecording();
  // base64 -> bytes -> Blob
  const bin = atob(r.base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { blob: new Blob([bytes], { type: r.mimeType || "audio/mp4" }), source: r.source };
}
