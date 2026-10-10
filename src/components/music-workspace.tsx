import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { AppNav } from '@/components/app-nav';
import { defaultProfile, type ProfileData, type ProfileLibrary } from '@/components/music-profile';
import { MiniPlayer, type PlayerTrack } from '@/components/mini-player';
import { WorkspaceContext } from '@/components/workspace-context';
import { LIBRARY_STORAGE_KEY, readLibrary, type DJTrack } from '@/lib/dj-library';
import { localDay, streakDays, type Activity, type MusicEvent } from '@/lib/music-profile';
import { completeMission, DEFAULT_ENGAGEMENT, engagementKey, FREQUENCY_SYMBOLS, MISSIONS, readEngagement, type Engagement, type MissionId } from '@/lib/profile-engagement';
import { supabase } from '@/integrations/supabase/client';

// The original app stays on its Diário tab; its own bottom nav is hidden so the single app nav owns routing.
const FRAME_STYLE = 'nav[aria-label="Navegação principal"]{display:none!important} header button[aria-label^="Crate Streak:"] span[aria-hidden] {font-family: "Noto Color Emoji", sans-serif;}';

function svgUri(svg: Element) { const copy = document.importNode(svg, true); copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`; }

export function MusicWorkspace({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const onDiary = pathname === '/', onDJ = pathname === '/dj';
  const [ready, setReady] = useState(false);
  const [library, setLibrary] = useState<ProfileLibrary>({ tracks: [], logDays: [] }), [djTracks, setDjTracks] = useState<DJTrack[]>([]);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile), [userId, setUserId] = useState<string | null>(null);
  const [engagement, setEngagement] = useState<Engagement>(DEFAULT_ENGAGEMENT), [player, setPlayer] = useState<PlayerTrack | null>(null), [toast, setToast] = useState('');
  const iframe = useRef<HTMLIFrameElement>(null), activityRef = useRef<Activity[]>([]), userRef = useRef<string | null>(null), engagementRef = useRef<Engagement>(DEFAULT_ENGAGEMENT);
  const baseline = useRef<{ ids: string[]; reviews: string[] } | null>(null), rawRef = useRef<string | null | undefined>(undefined);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  const persistEngagement = useCallback((next: Engagement) => { engagementRef.current = next; setEngagement(next); try { localStorage.setItem(engagementKey(userRef.current), JSON.stringify(next)); } catch { setToast('As preferências não puderam ser guardadas neste navegador.'); } }, []);
  const award = useCallback((id: MissionId) => { const next = completeMission(engagementRef.current, id); if (next === engagementRef.current) return; persistEngagement(next); setToast(`+${MISSIONS.find(m => m.id === id)?.xp ?? 0} XP · Desafio concluído`); }, [persistEngagement]);

  // Read-only: the acervo is only ever read from storage here, never written.
  const buildDJTracks = useCallback((raw: string | null) => {
    const articles = Array.from(iframe.current?.contentDocument?.querySelectorAll('article[aria-label]') ?? []);
    setDjTracks(readLibrary(raw).map(track => { if (track.cover) return track; const art = articles.find(e => e.getAttribute('aria-label') === `${track.title}, ${track.artist}. Abrir detalhes`)?.querySelector('svg'); return art ? { ...track, cover: svgUri(art) } : track; }));
  }, []);
  const sync = useCallback(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(LIBRARY_STORAGE_KEY); } catch { raw = null; }
    if (raw !== rawRef.current) {
      rawRef.current = raw;
      try {
        const data = JSON.parse(raw ?? '{}');
        const next: ProfileLibrary = { tracks: Array.isArray(data.tracks) ? data.tracks : [], logDays: Array.isArray(data.logDays) ? data.logDays : [] }; setLibrary(next);
        const own = next.tracks.filter(t => !t.sample), ids = own.map(t => t.id), reviews = own.filter(t => t.review?.trim()).map(t => `${t.id}:${t.review}`);
        if (baseline.current) { if (ids.some(id => !baseline.current?.ids.includes(id))) { award('track'); award('catalog'); } if (reviews.some(review => !baseline.current?.reviews.includes(review))) award('review'); } baseline.current = { ids, reviews };
      } catch { setLibrary({ tracks: [], logDays: [] }); }
      buildDJTracks(raw);
    }
    setLibrary(current => {
      const count = streakDays([...current.logDays, ...activityRef.current.map(a => a.day)], new Date());
      const doc = iframe.current?.contentDocument, streakButton = doc?.querySelector('header button[aria-label^="Crate Streak:"]');
      const symbol = streakButton?.querySelector('span[aria-hidden="true"]'), emoji = FREQUENCY_SYMBOLS[engagementRef.current.symbol]?.emoji ?? '🍍';
      if (symbol && symbol.textContent !== emoji) symbol.textContent = emoji;
      const number = streakButton?.querySelector('span:not([aria-hidden])'); if (number && number.textContent !== String(count)) number.textContent = String(count);
      if (count >= 3) queueMicrotask(() => award('streak'));
      return current;
    });
  }, [award, buildDJTracks]);

  useEffect(() => {
    if (iframe.current?.contentDocument?.readyState === 'complete') setReady(true);
    sync();
    let stopped = false; let generation = 0;
    async function load() { const version = ++generation; const { data } = await supabase.auth.getUser(); if (stopped || version !== generation) return; const id = data.user?.id ?? null; userRef.current = id; setUserId(id); let local: Engagement; try { local = readEngagement(localStorage.getItem(engagementKey(id))); } catch { local = readEngagement(null); } engagementRef.current = local; setEngagement(local); setProfile({ ...defaultProfile, avatar: local.avatar ?? 0 }); activityRef.current = []; if (!id) return; const { data: row } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle(); if (stopped || version !== generation || !row) return; const next = { display_name: row.display_name, bio: row.bio, avatar: local.avatar ?? row.avatar, activity: row.activity as unknown as Activity[], events: row.events as unknown as MusicEvent[] }; setProfile(next); activityRef.current = next.activity; }
    void load(); const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') void load(); });
    const timer = setInterval(sync, 1500);
    return () => { stopped = true; clearInterval(timer); subscription.unsubscribe(); };
  }, [sync]);
  useEffect(() => { sync(); }, [engagement, sync]);
  useEffect(() => { if (onDJ) buildDJTracks(rawRef.current ?? null); }, [onDJ, ready, buildDJTracks]);

  useEffect(() => {
    if (!ready) return; const doc = iframe.current?.contentDocument; if (!doc) return;
    const frameStyle = doc.createElement('style'); frameStyle.textContent = FRAME_STYLE; doc.head.appendChild(frameStyle);
    const emojiFont = doc.createElement('link'); emojiFont.rel = 'stylesheet'; emojiFont.href = 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap'; doc.head.appendChild(emojiFont);
    rawRef.current = undefined; sync();
    function click(event: Event) {
      const target = event.target as Element | null; if (!target || typeof target.closest !== 'function') return;
      const article = target.closest('article[aria-label]'); if (!article) return;
      const now = new Date(), day = localDay(now), trackId = article.getAttribute('aria-label') ?? '';
      const next = [...activityRef.current.filter(a => !(a.day === day && a.trackId === trackId)), { day, hour: now.getHours(), trackId }]; activityRef.current = next; setProfile(p => ({ ...p, activity: next })); const id = userRef.current; if (id) void supabase.from('profiles').update({ activity: JSON.parse(JSON.stringify(next)) }).eq('id', id).then(() => {});
      const title = article.querySelector('h3')?.textContent ?? trackId.split(',')[0] ?? '', artist = article.querySelector('p')?.textContent ?? '';
      let stored: Record<string, unknown> | undefined; try { const raw = JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) ?? '{}'); stored = raw.tracks?.find((t: Record<string, unknown>) => t['title'] === title && t['artist'] === artist); } catch { stored = undefined; }
      const svg = article.querySelector('svg'); let cover = typeof stored?.['cover'] === 'string' ? stored['cover'] : null; if (!cover && svg) cover = svgUri(svg);
      const audio = stored?.['previewUrl'] ?? stored?.['audioUrl']; setPlayer({ id: typeof stored?.['id'] === 'string' ? stored['id'] : trackId, title, artist, cover, ...(typeof audio === 'string' && /^https:\/\//.test(audio) ? { audioUrl: audio } : {}) }); sync();
    }
    doc.addEventListener('click', click, true);
    return () => { frameStyle.remove(); emojiFont.remove(); doc.removeEventListener('click', click, true); };
  }, [ready, sync]);

  async function saveProfile(next: ProfileData) { const previous = profile; setProfile(next); activityRef.current = next.activity; persistEngagement({ ...engagementRef.current, avatar: next.avatar }); if (!userId) return true; const { error } = await supabase.from('profiles').upsert({ id: userId, ...next, activity: JSON.parse(JSON.stringify(next.activity)), events: JSON.parse(JSON.stringify(next.events)) }); if (error) { setProfile(previous); persistEngagement({ ...engagementRef.current, avatar: previous.avatar }); return false; } return true; }

  const value = { profile, saveProfile, library, djTracks, engagement, setSymbol: (symbol: number) => persistEngagement({ ...engagementRef.current, symbol }), award, signedIn: Boolean(userId), openPlayer: setPlayer };
  return <WorkspaceContext.Provider value={value}>
    <div className={onDJ ? 'music-workspace dj-theme' : 'music-workspace curation-theme'}>
      <AppNav />
      <iframe ref={iframe} src="/music-desk-pro.html" title="Music Desk Pro — Diário" className="curation-frame" hidden={!onDiary} onLoad={() => { setReady(true); }} allow="autoplay; microphone; clipboard-write; fullscreen" />
      {!onDiary && <main className="workspace-page">{children}</main>}
      {player && <MiniPlayer track={player} onClose={() => setPlayer(null)} onMessage={setToast} onPlayed={() => award('catalog')} />}
      {toast && <div className="profile-toast profile-theme" role="status"><span>✦</span>{toast}</div>}
    </div>
  </WorkspaceContext.Provider>;
}
