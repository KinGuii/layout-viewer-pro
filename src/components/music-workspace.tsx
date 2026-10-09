import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Disc3, Headphones, ListMusic, SlidersHorizontal, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DJDesk } from '@/components/dj-desk';
import { MusicProfile, defaultProfile, type ProfileData, type ProfileLibrary } from '@/components/music-profile';
import { MiniPlayer, type PlayerTrack } from '@/components/mini-player';
import { LIBRARY_STORAGE_KEY, readLibrary, type DJTrack } from '@/lib/dj-library';
import { localDay, streakDays, type Activity, type MusicEvent } from '@/lib/music-profile';
import { completeMission, DEFAULT_ENGAGEMENT, engagementKey, FREQUENCY_SYMBOLS, MISSIONS, readEngagement, type Engagement, type MissionId } from '@/lib/profile-engagement';
import { supabase } from '@/integrations/supabase/client';

export function MusicWorkspace() {
 const [djMode,setDjMode]=useState(false),[profileMode,setProfileMode]=useState(false),[ready,setReady]=useState(false);
 const [tracks,setTracks]=useState<DJTrack[]>([]),[library,setLibrary]=useState<ProfileLibrary>({tracks:[],logDays:[]});
 const [profile,setProfile]=useState<ProfileData>(defaultProfile),[userId,setUserId]=useState<string|null>(null);
 const [engagement,setEngagement]=useState<Engagement>(DEFAULT_ENGAGEMENT),[player,setPlayer]=useState<PlayerTrack|null>(null),[toast,setToast]=useState('');
 const iframe=useRef<HTMLIFrameElement>(null),activityRef=useRef<Activity[]>([]),userRef=useRef<string|null>(null),engagementRef=useRef<Engagement>(DEFAULT_ENGAGEMENT);
 const baseline=useRef<{ids:string[];reviews:string[]}|null>(null);
 function notify(message:string){setToast(message);}
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer);},[toast]);
 const persistEngagement=useCallback((next:Engagement)=>{engagementRef.current=next;setEngagement(next);try{localStorage.setItem(engagementKey(userRef.current),JSON.stringify(next));}catch{setToast('As preferências não puderam ser guardadas neste navegador.');}},[]);
 const award=useCallback((id:MissionId)=>{const next=completeMission(engagementRef.current,id);if(next===engagementRef.current)return;persistEngagement(next);setToast(`+${MISSIONS.find(m=>m.id===id)?.xp??0} XP · Desafio concluído`);},[persistEngagement]);
 const sync=useCallback(()=>{
  const doc=iframe.current?.contentDocument;if(!doc)return;
  const fourth=doc.querySelectorAll('nav[aria-label="Navegação principal"] button')[3];const label=fourth?.querySelector('span');if(label&&label.textContent!=='Perfil')label.textContent='Perfil';
  const logo=Array.from(doc.querySelectorAll('header span')).find(el=>el.textContent==='Music Desk')?.parentElement;
  if(logo){logo.setAttribute('role','button');logo.setAttribute('tabindex','0');logo.setAttribute('aria-label','Music Desk — ir para Diário');logo.style.cursor='pointer';}
  const streakButton=doc.querySelector('header button[aria-label^="Crate Streak:"]');const symbol=streakButton?.querySelector('span[aria-hidden="true"]');const emoji=FREQUENCY_SYMBOLS[engagementRef.current.symbol]?.emoji??'🍍';if(symbol&&symbol.textContent!==emoji)symbol.textContent=emoji;
  try{
   const raw=JSON.parse(iframe.current?.contentWindow?.localStorage.getItem(LIBRARY_STORAGE_KEY)??'{}');
   const next:ProfileLibrary={tracks:Array.isArray(raw.tracks)?raw.tracks:[],logDays:Array.isArray(raw.logDays)?raw.logDays:[]};setLibrary(next);
   const own=next.tracks.filter(t=>!t.sample),ids=own.map(t=>t.id),reviews=own.filter(t=>t.review?.trim()).map(t=>`${t.id}:${t.review}`);
   if(baseline.current){if(ids.some(id=>!baseline.current?.ids.includes(id)))award('track');if(reviews.some(review=>!baseline.current?.reviews.includes(review)))award('review');}baseline.current={ids,reviews};
   const days=[...next.logDays,...activityRef.current.map(a=>a.day)];const count=streakDays(days,new Date());
   const number=streakButton?.querySelector('span:not([aria-hidden])');if(number&&number.textContent!==String(count))number.textContent=String(count);
   if(count>=3)award('streak');
  }catch{setLibrary({tracks:[],logDays:[]});}
 },[award]);
 function navigate(index:number){setDjMode(false);if(index===3){setProfileMode(true);return;}setProfileMode(false);iframe.current?.contentDocument?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Navegação principal"] button')[index]?.click();sync();}
 useEffect(()=>{
  if(iframe.current?.contentDocument?.readyState==='complete')setReady(true);
  let stopped=false;let generation=0;
  async function load(){const version=++generation;const {data}=await supabase.auth.getUser();if(stopped||version!==generation)return;const id=data.user?.id??null;userRef.current=id;setUserId(id);let local:Engagement;try{local=readEngagement(localStorage.getItem(engagementKey(id)));}catch{local=readEngagement(null);}engagementRef.current=local;setEngagement(local);setProfile({...defaultProfile,avatar:local.avatar??0});activityRef.current=[];if(!id)return;const {data:row}=await supabase.from('profiles').select('*').eq('id',id).maybeSingle();if(stopped||version!==generation||!row)return;const next={display_name:row.display_name,bio:row.bio,avatar:local.avatar??row.avatar,activity:row.activity as unknown as Activity[],events:row.events as unknown as MusicEvent[]};setProfile(next);activityRef.current=next.activity;}
  void load();const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='SIGNED_IN'||event==='USER_UPDATED'||event==='SIGNED_OUT')void load();});return()=>{stopped=true;subscription.unsubscribe();};
 },[]);
 useEffect(()=>{if(ready)sync();},[engagement,ready,sync]);
 useEffect(()=>{
  if(!ready)return;const doc=iframe.current?.contentDocument;if(!doc)return;sync();const observer=new MutationObserver(sync);observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-current']});
  function click(event:Event){const target=event.target as Element|null;if(!target||typeof target.closest!=='function')return;
   const nav=target.closest('nav[aria-label="Navegação principal"] button');const buttons=Array.from(doc?.querySelectorAll('nav[aria-label="Navegação principal"] button')??[]);
   if(nav===buttons[3]){event.preventDefault();event.stopImmediatePropagation();setProfileMode(true);return;}
   const logo=target.closest('[aria-label="Music Desk — ir para Diário"]');if(logo){event.preventDefault();event.stopImmediatePropagation();setProfileMode(false);(buttons[0] as HTMLButtonElement|undefined)?.click();return;}
   const article=target.closest('article[aria-label]');if(!article)return;
   const now=new Date(),day=localDay(now),trackId=article.getAttribute('aria-label')??'';
   const next=[...activityRef.current.filter(a=>!(a.day===day&&a.trackId===trackId)),{day,hour:now.getHours(),trackId}];activityRef.current=next;setProfile(p=>({...p,activity:next}));const id=userRef.current;if(id)void supabase.from('profiles').update({activity:JSON.parse(JSON.stringify(next))}).eq('id',id).then(()=>{});
   const title=article.querySelector('h3')?.textContent??trackId.split(',')[0]??'',artist=article.querySelector('p')?.textContent??'';
   let stored:Record<string,unknown>|undefined;try{const raw=JSON.parse(iframe.current?.contentWindow?.localStorage.getItem(LIBRARY_STORAGE_KEY)??'{}');stored=raw.tracks?.find((t:Record<string,unknown>)=>t['title']===title&&t['artist']===artist);}catch{}
   const svg=article.querySelector('svg');let cover=typeof stored?.['cover']==='string'?stored['cover']:null;if(!cover&&svg){const copy=document.importNode(svg,true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');cover=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`;}
   const audio=stored?.['previewUrl']??stored?.['audioUrl'];setPlayer({id:typeof stored?.['id']==='string'?stored['id']:trackId,title,artist,cover,...(typeof audio==='string'&&/^https:\/\//.test(audio)?{audioUrl:audio}:{})});if(stored?.['sample']||!stored)award('catalog');sync();
  }
  function keyboard(event:KeyboardEvent){const target=event.target as Element|null;if(target?.closest('[aria-label="Music Desk — ir para Diário"]')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();(target.closest('[role="button"]') as HTMLElement|null)?.click();}}
  doc.addEventListener('click',click,true);doc.addEventListener('keydown',keyboard,true);return()=>{observer.disconnect();doc.removeEventListener('click',click,true);doc.removeEventListener('keydown',keyboard,true);};
 },[ready,sync,award]);
 async function saveProfile(next:ProfileData){const previous=profile;setProfile(next);activityRef.current=next.activity;persistEngagement({...engagementRef.current,avatar:next.avatar});if(!userId)return true;const {error}=await supabase.from('profiles').upsert({id:userId,...next,activity:JSON.parse(JSON.stringify(next.activity)),events:JSON.parse(JSON.stringify(next.events))});if(error){setProfile(previous);persistEngagement({...engagementRef.current,avatar:previous.avatar});return false;}return true;}
 function activateDJ(){try{const data=readLibrary(iframe.current?.contentWindow?.localStorage.getItem(LIBRARY_STORAGE_KEY)??null);const articles=Array.from(iframe.current?.contentDocument?.querySelectorAll('article[aria-label]')??[]);setTracks(data.map(track=>{if(track.cover)return track;const artwork=articles.find(e=>e.getAttribute('aria-label')===`${track.title}, ${track.artist}. Abrir detalhes`)?.querySelector('svg');if(!artwork)return track;const copy=document.importNode(artwork,true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');return {...track,cover:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`};}));}catch{setTracks([]);}setDjMode(true);}
 return <div className={djMode?'music-workspace dj-theme':'music-workspace curation-theme'}>
  {djMode&&<div className="workspace-switch-bar"><div className="workspace-current"><Headphones size={16}/><Button variant="ghost" onClick={()=>navigate(0)}>Music Desk <strong>PRO</strong></Button><span>{FREQUENCY_SYMBOLS[engagement.symbol]?.emoji} {streakDays([...library.logDays,...profile.activity.map(a=>a.day)],new Date())}</span></div><Button variant="outline" size="sm" onClick={()=>setDjMode(false)}><ArrowLeft/>Voltar para Curadoria</Button></div>}
  <iframe ref={iframe} src="/music-desk-pro.html" title="Music Desk Pro — Curadoria" className="curation-frame" hidden={djMode||profileMode} onLoad={()=>{setReady(true);sync();}} allow="autoplay; microphone; clipboard-write; fullscreen"/>
  {!djMode&&profileMode&&<><MusicProfile profile={profile} onSave={saveProfile} library={library} onDJ={activateDJ} onHome={()=>navigate(0)} signedIn={Boolean(userId)} engagement={engagement} onSymbol={symbol=>persistEngagement({...engagementRef.current,symbol})} onMission={award}/><nav className="profile-nav profile-theme" aria-label="Navegação principal">{[{label:'Diário',Icon:Disc3},{label:'Workstation',Icon:SlidersHorizontal},{label:'Setlab',Icon:ListMusic},{label:'Perfil',Icon:UserRound}].map(({label,Icon},i)=><Button variant="ghost" key={label} onClick={()=>navigate(i)} aria-current={i===3?'page':undefined}><Icon size={22}/><span>{label}</span></Button>)}</nav></>}
  {djMode&&<DJDesk tracks={tracks}/>}
  {player&&!djMode&&<MiniPlayer track={player} onClose={()=>setPlayer(null)} onMessage={notify}/>}
  {toast&&<div className="profile-toast profile-theme" role="status"><span>✦</span>{toast}</div>}
 </div>;
}
