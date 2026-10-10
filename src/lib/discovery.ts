// Mirrors the compiled Diário's "Lançamentos" and "Recomendações" criteria (read-only).
export interface DiscoveryTrack { id: string; title?: string; artist?: string; status?: string; cover?: unknown; previewUrl?: unknown; audioUrl?: unknown }

const STATUS_ORDER: Record<string, number> = { radar: 0, club: 1, repeat: 2 };

/** Latest arrivals: the first 8 tracks in stored order, as the Diário shows them. */
export function releases<T extends DiscoveryTrack>(tracks: T[]): T[] {
  return tracks.slice(0, 8);
}

/** Second-listen picks: everything not on repeat, radar before club, stored order as tiebreak, max 8. */
export function recommendations<T extends DiscoveryTrack>(tracks: T[]): T[] {
  return tracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => track.status !== 'repeat')
    .sort((a, b) => (STATUS_ORDER[a.track.status ?? ''] ?? 3) - (STATUS_ORDER[b.track.status ?? ''] ?? 3) || a.index - b.index)
    .map(({ track }) => track)
    .slice(0, 8);
}
