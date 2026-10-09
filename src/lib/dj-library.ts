export const LIBRARY_STORAGE_KEY = "music-desk-pro:v1";
export const DEFAULT_BPM_TOLERANCE = 8;

export interface DJTrack {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  bpm: number | null;
  key: string;
  energy: number | null;
  elements: string[];
  mixTip: string;
  review: string;
  setRole: string;
}

export function readLibrary(value: string | null): DJTrack[] {
  if (!value) return [];
  try {
    const data = JSON.parse(value);
    if (!Array.isArray(data.tracks)) return [];
    return data.tracks.filter((track: Record<string, unknown>) => track && typeof track.id === "string" && typeof track.title === "string" && typeof track.artist === "string").map((track: Record<string, unknown>) => ({
      id: String(track.id), title: String(track.title), artist: String(track.artist),
      cover: typeof track.cover === "string" && /^(https:\/\/|data:image\/)/.test(track.cover) ? track.cover : null,
      bpm: track.bpm !== null && track.bpm !== "" && Number.isFinite(Number(track.bpm)) && Number(track.bpm) > 0 ? Number(track.bpm) : null,
      key: typeof track.key === "string" ? track.key : "",
      energy: Number.isInteger(track.energy) && Number(track.energy) >= 1 && Number(track.energy) <= 5 ? Number(track.energy) : null,
      elements: Array.isArray(track.elements ?? track.tags) ? (track.elements ?? track.tags as unknown[] as unknown) as string[] : [],
      mixTip: typeof (track.mixTip ?? track.mixNote) === "string" ? String(track.mixTip ?? track.mixNote) : "",
      review: typeof track.review === "string" ? track.review : "",
      setRole: typeof track.setRole === "string" ? track.setRole : "",
    })).map((track: DJTrack) => ({ ...track, elements: track.elements.filter((tag) => typeof tag === "string") }));
  } catch { return []; }
}

const musicalKeys: Record<string, string> = {
  "abm": "1A", "g#m": "1A", "ebm": "2A", "d#m": "2A", "bbm": "3A", "a#m": "3A", "fm": "4A", "cm": "5A", "gm": "6A", "dm": "7A", "am": "8A", "em": "9A", "bm": "10A", "f#m": "11A", "gbm": "11A", "c#m": "12A", "dbm": "12A",
  "b": "1B", "f#": "2B", "gb": "2B", "db": "3B", "c#": "3B", "ab": "4B", "g#": "4B", "eb": "5B", "d#": "5B", "bb": "6B", "a#": "6B", "f": "7B", "c": "8B", "g": "9B", "d": "10B", "a": "11B", "e": "12B",
};

export function camelotKey(value: string): string | null {
  const compact = value.trim().replace(/♯/g, "#").replace(/♭/g, "b").replace(/\s+/g, "");
  if (/^(?:[1-9]|1[0-2])[ab]$/i.test(compact)) return compact.toUpperCase();
  return musicalKeys[compact.toLowerCase().replace(/minor$/, "m").replace(/major$/, "")] ?? null;
}

export function harmonicMatch(first: string, second: string): boolean {
  const a = camelotKey(first), b = camelotKey(second);
  if (!a || !b) return false;
  const numberA = parseInt(a), numberB = parseInt(b);
  if (numberA === numberB) return true;
  const gap = Math.abs(numberA - numberB);
  return a.slice(-1) === b.slice(-1) && (gap === 1 || gap === 11);
}

export function transitionMatches(source: DJTrack, tracks: DJTrack[], tolerance = DEFAULT_BPM_TOLERANCE): DJTrack[] {
  if (source.bpm === null || !camelotKey(source.key)) return [];
  const bpm = source.bpm;
  return tracks.filter((track) => track.id !== source.id && track.bpm !== null && Math.abs(track.bpm - bpm) <= tolerance && harmonicMatch(source.key, track.key))
    .sort((a, b) => Math.abs((a.bpm ?? 0) - bpm) - Math.abs((b.bpm ?? 0) - bpm));
}