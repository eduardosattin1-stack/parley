/**
 * Store of known speakers' pyannote voiceprints, keyed by name (lowercased).
 * Persisted in localStorage so people named once are recognized in future
 * recordings. The owner's own voiceprint stays in `parley-voice-signature`;
 * this map is for everyone else.
 */

const KEY = "parley-known-voiceprints";

type Store = Record<string, { name: string; voiceprint: string }>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

/** True if we already have a voiceprint for this name. */
export function hasVoiceprint(name: string): boolean {
  return !!read()[name.trim().toLowerCase()];
}

/** Save/replace a voiceprint for a name. */
export function saveVoiceprint(name: string, voiceprint: string) {
  const s = read();
  s[name.trim().toLowerCase()] = { name: name.trim(), voiceprint };
  write(s);
}

/** Rename a stored voiceprint's key+display name (keeps the voiceprint). */
export function renameVoiceprint(oldName: string, newName: string) {
  const s = read();
  const k = oldName.trim().toLowerCase();
  if (!s[k]) return;
  const vp = s[k].voiceprint;
  delete s[k];
  s[newName.trim().toLowerCase()] = { name: newName.trim(), voiceprint: vp };
  write(s);
}

/** All known voiceprints as the array pyannote /identify expects. */
export function allVoiceprints(): { label: string; voiceprint: string }[] {
  return Object.values(read()).map((v) => ({ label: v.name, voiceprint: v.voiceprint }));
}
