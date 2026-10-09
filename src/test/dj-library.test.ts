import { describe, expect, it } from "vitest";
import { camelotKey, harmonicMatch, readLibrary, transitionMatches, type DJTrack } from "@/lib/dj-library";

const track = (id: string, bpm: number | null, key: string): DJTrack => ({ id, bpm, key, title: id, artist: "Artist", cover: null, energy: null, elements: [], mixTip: "", review: "", setRole: "" });

describe("DJ Desk", () => {
  it("accepts the same Camelot key", () => { expect(harmonicMatch("8A", "8A")).toBe(true); });
  it("accepts adjacent keys and the circular 12-to-1 boundary", () => {
    expect(harmonicMatch("8A", "9A")).toBe(true);
    expect(harmonicMatch("1A", "12A")).toBe(true);
    expect(harmonicMatch("8A", "10A")).toBe(false);
  });
  it("accepts relative major/minor but not diagonal keys", () => {
    expect(harmonicMatch("8A", "8B")).toBe(true);
    expect(harmonicMatch("8A", "9B")).toBe(false);
  });
  it("requires both close BPM and harmonic compatibility, excludes the source", () => {
    const source = track("source", 120, "8A");
    expect(transitionMatches(source, [source, track("near", 122, "9A"), track("limit", 128, "8B"), track("far", 129, "8A"), track("wrong-key", 120, "3A")]).map(t => t.id)).toEqual(["near", "limit"]);
  });
  it("does not match unknown BPM or keys", () => {
    expect(transitionMatches(track("source", null, "8A"), [track("other", 120, "8A")])).toEqual([]);
    expect(harmonicMatch("", "8A")).toBe(false);
  });
  it("reads the existing library without mutating or inventing metadata", () => {
    const stored = JSON.stringify({ tracks: [{ id: "existing", artist: "Ana", title: "Faixa", bpm: 118, key: "8A", review: "Veludo", energy: 6 }] });
    const result = readLibrary(stored);
    expect(result[0]).toMatchObject({ id: "existing", bpm: 118, key: "8A", energy: null, elements: [], mixTip: "" });
    expect(JSON.parse(stored).tracks[0].energy).toBe(6);
  });
  it("normalizes musical keys to Camelot", () => { expect(camelotKey("Am")).toBe("8A"); expect(camelotKey("G major")).toBe("9B"); });
});