/**
 * Audio slicing for per-speaker voiceprint enrollment.
 *
 * Given a full recording Blob and a set of {start,end} turn timings (ms) for one
 * speaker, pick that speaker's single longest turn (capped at 30s — pyannote's
 * voiceprint limit) and return it as a mono 16 kHz WAV Blob suitable for
 * /api/voiceprint. We use the single longest turn (not a concatenation of many)
 * because pyannote requires a clean, single-speaker, no-overlap clip — one long
 * continuous turn is the safest bet for that.
 */

type Turn = { start: number; end: number }; // milliseconds

const MAX_CLIP_SEC = 28; // stay safely under pyannote's 30s cap
const MIN_CLIP_SEC = 3;  // too short -> unreliable voiceprint

/** Pick the longest turn, trimmed to MAX_CLIP_SEC. Returns null if none usable. */
function pickBestTurn(turns: Turn[]): { startSec: number; durSec: number } | null {
  let best: Turn | null = null;
  let bestDur = 0;
  for (const t of turns) {
    const dur = (t.end - t.start) / 1000;
    if (dur > bestDur) { bestDur = dur; best = t; }
  }
  if (!best || bestDur < MIN_CLIP_SEC) return null;
  return { startSec: best.start / 1000, durSec: Math.min(bestDur, MAX_CLIP_SEC) };
}

/** Encode an AudioBuffer (already mono) to a 16-bit PCM WAV Blob. */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataLen = samples.length * 2;
  const ab = new ArrayBuffer(44 + dataLen);
  const view = new DataView(ab);
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);          // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataLen, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([ab], { type: "audio/wav" });
}

/**
 * Slice a single speaker's best (longest) turn from `blob` and return it as a
 * mono 16 kHz WAV Blob, or null if the audio can't be decoded or no usable turn
 * exists. Best-effort: callers should treat null as "skip enrollment".
 */
export async function sliceSpeakerClip(blob: Blob, turns: Turn[]): Promise<Blob | null> {
  try {
    const pick = pickBestTurn(turns);
    if (!pick) return null;

    const arrayBuf = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const decodeCtx = new AudioCtx();
    const decoded: AudioBuffer = await decodeCtx.decodeAudioData(arrayBuf.slice(0));
    decodeCtx.close?.();

    const targetRate = 16000;
    const lengthFrames = Math.floor(pick.durSec * targetRate);
    if (lengthFrames <= 0) return null;

    // Render the chosen window to mono 16 kHz via an OfflineAudioContext.
    const offline = new OfflineAudioContext(1, lengthFrames, targetRate);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start(0, pick.startSec, pick.durSec);
    const rendered = await offline.startRendering();
    return audioBufferToWav(rendered);
  } catch {
    return null;
  }
}
