import { describe, expect, it } from 'vitest';
import { completeMission, missionXP, readEngagement, curatorLevel, FREQUENCY_SYMBOLS, CONCEPT_EVENTS, recentTextures } from '@/lib/profile-engagement';
describe('Curator engagement rules', () => {
  it('awards 50 XP for registering a track', () => expect(missionXP(['track'])).toBe(50));
  it('awards 30 XP for a sensory review', () => expect(missionXP(['review'])).toBe(30));
  it('awards 100 XP for three consecutive days', () => expect(missionXP(['streak'])).toBe(100));
  it('awards 20 XP for catalog listening or saving', () => expect(missionXP(['catalog'])).toBe(20));
  it('never duplicates a mission reward', () => { const state = completeMission({symbol:0,completed:[]}, 'track'); expect(missionXP(completeMission(state,'track').completed)).toBe(50); });
  it('defaults to pineapple and accepts nine symbols', () => { expect(FREQUENCY_SYMBOLS[readEngagement(null).symbol]?.emoji).toBe('🍍'); expect(FREQUENCY_SYMBOLS).toHaveLength(9); expect(readEngagement('{"symbol":8,"avatar":8}')).toMatchObject({symbol:8,avatar:8}); expect(readEngagement('{"symbol":9}').symbol).toBe(0); });
  it('restores local avatar and deduplicates completions', () => expect(readEngagement('{"avatar":4,"completed":["track","track","fake"]}')).toEqual({avatar:4,symbol:0,completed:['track']}));
  it('uses 100 XP per level', () => expect(curatorLevel(200)).toMatchObject({level:3,progress:0,next:300}));
  it('preserves requested event dates and prices', () => expect(CONCEPT_EVENTS.map(e => [e.date,e.price])).toEqual([['2026-10-18','R$ 40'],['2026-10-24','R$ 60'],['2026-11-07','Entrada Franca']]));
  it('exports only the last three real textures', () => { expect(recentTextures([{textures:['Veludo','Fumaça Doce','Brasa','Vidro']}])).toEqual(['Fumaça Doce','Brasa','Vidro']); expect(recentTextures([])).toEqual([]); });
});