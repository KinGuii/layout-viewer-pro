import { describe,it,expect } from 'vitest';
import { streakDays,weekDays,badges,calendarFile,dailyFact } from '@/lib/music-profile';
describe('Personal musical profile',()=>{
 it('counts consecutive days, deduplicates and allows yesterday before today is completed',()=>{expect(streakDays(['2026-10-07','2026-10-08','2026-10-08'],new Date(2026,9,9))).toBe(2);expect(streakDays(['2026-10-07'],new Date(2026,9,9))).toBe(0);});
 it('week has seven days starting Monday',()=>{expect(weekDays(new Date(2026,9,9))).toEqual(['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-10','2026-10-11']);});
 it('first garimpo requires a personal track, not samples',()=>{expect(badges([{sample:true}],[])[0]).toBe(false);expect(badges([{sample:false}],[])[0]).toBe(true);});
 it('night collector unlocks on exploration at 22h but not 21h',()=>{expect(badges([],[{day:'2026-10-09',hour:22,trackId:'x'}])[1]).toBe(true);expect(badges([],[{day:'2026-10-09',hour:21,trackId:'x'}])[1]).toBe(false);});
 it('immersive listener requires a personal review',()=>{expect(badges([{review:' '}],[])[2]).toBe(false);expect(badges([{review:'Textura de veludo'}],[])[2]).toBe(true);});
 it('calendar export preserves date and escapes user values',()=>{const result=calendarFile({id:'x',name:'Show, som',date:'2026-10-31',location:'São Paulo'});expect(result).toContain('DTSTART;VALUE=DATE:20261031');expect(result).toContain('DTEND;VALUE=DATE:20261101');expect(result).toContain('SUMMARY:Show\\, som');});
 it('curiosity stays the same throughout the selected day',()=>{expect(dailyFact('2026-10-09')).toEqual(dailyFact('2026-10-09'));expect(dailyFact('2026-10-09')).not.toEqual(dailyFact('2026-10-10'));});
});
