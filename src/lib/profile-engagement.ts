export const FREQUENCY_SYMBOLS = [
  { emoji: '🍍', name: 'Abacaxi' }, { emoji: '🪩', name: 'Disco Ball' },
  { emoji: '⚡', name: 'Raio' }, { emoji: '👁️', name: 'Olho' },
  { emoji: '🪐', name: 'Planeta' }, { emoji: '🌊', name: 'Onda' },
  { emoji: '📻', name: 'Fita' }, { emoji: '🎛️', name: 'Fader' },
  { emoji: '🖤', name: 'Coração Dark' },
] as const;
export const MISSIONS = [
  { id: 'track', label: 'Cadastrar uma faixa no Diário', xp: 50 },
  { id: 'review', label: 'Definir uma micro-review com textura sonora', xp: 30 },
  { id: 'streak', label: 'Completar 3 dias consecutivos de garimpo', xp: 100 },
  { id: 'catalog', label: 'Ouvir ou salvar uma faixa do catálogo interno', xp: 20 },
] as const;
export type MissionId = typeof MISSIONS[number]['id'];
export interface Engagement { symbol: number; completed: MissionId[]; avatar?: number }
export const DEFAULT_ENGAGEMENT: Engagement = { symbol: 0, completed: [] };
export function engagementKey(owner: string | null) { return `music-desk-profile:v2:${owner ?? 'guest'}`; }
export function readEngagement(raw: string | null): Engagement {
  try {
    const data = JSON.parse(raw ?? '{}');
    return {
      symbol: Number.isInteger(data?.symbol) && data.symbol >= 0 && data.symbol < 9 ? data.symbol : 0,
      completed: Array.isArray(data?.completed) ? [...new Set<MissionId>(data.completed.filter((id: unknown) => MISSIONS.some(m => m.id === id)))] : [],
      avatar: Number.isInteger(data?.avatar) && data.avatar >= 0 && data.avatar < 9 ? data.avatar : undefined,
    };
  } catch { return { ...DEFAULT_ENGAGEMENT, completed: [] }; }
}
export function missionXP(completed: MissionId[]) { return MISSIONS.reduce((sum, m) => sum + (completed.includes(m.id) ? m.xp : 0), 0); }
export function completeMission(state: Engagement, id: MissionId): Engagement {
  return state.completed.includes(id) ? state : { ...state, completed: [...state.completed, id] };
}
export function curatorLevel(xp: number) {
  const level = Math.floor(Math.max(0, xp) / 100) + 1;
  const names = ['Ouvinte Curioso', 'Explorador de Texturas', 'Garimpador Noturno'];
  return { level, name: names[Math.min(level - 1, names.length - 1)], progress: Math.max(0, xp) % 100, next: level * 100 };
}
export interface TextureTrack { sample?: boolean; textures?: string[]; tags?: string[]; elements?: string[]; mood?: string; review?: string }
export function recentTextures(tracks: TextureTrack[]) {
  return [...new Set(tracks.filter(t => !t.sample).flatMap(t => t.textures ?? t.tags ?? t.elements ?? (t.mood ? [t.mood] : [])).filter(v => typeof v === 'string' && v.trim()))].slice(-3);
}
export const CONCEPT_EVENTS = [
  { id: 'subsolo', name: 'Subsolo Sessions: Deep House & Broken Beat', date: '2026-10-18', location: 'Galpão 04 - Distrito Industrial', price: 'R$ 40', tag: 'Shotgun', url: 'https://shotgun.live/pt-br' },
  { id: 'terraco', name: 'Terraço Noturno: Extended Sets & Vinil', date: '2026-10-24', location: 'Rooftop Mirante', price: 'R$ 60', tag: 'Sympla', url: 'https://www.sympla.com.br/' },
  { id: 'armazem', name: 'Armazém Som & Textura: Live Acts', date: '2026-11-07', location: 'Espaço Armazém', price: 'Entrada Franca', tag: 'Lista Amiga', url: 'https://www.sympla.com.br/eventos' },
];