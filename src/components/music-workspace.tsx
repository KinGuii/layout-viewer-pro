import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Disc3, Headphones, ListMusic, SlidersHorizontal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DJDesk } from "@/components/dj-desk";
import { MusicProfile, defaultProfile, type ProfileData, type ProfileLibrary } from "@/components/music-profile";
import { LIBRARY_STORAGE_KEY, readLibrary, type DJTrack } from "@/lib/dj-library";
import { localDay, type Activity, type MusicEvent } from '@/lib/music-profile';
import { supabase } from '@/integrations/supabase/client';

export function MusicWorkspace() {
  const [djMode, setDjMode] = useState(false);
  const [profileMode, setProfileMode] = useState(false);
  const [tracks, setTracks] = useState<DJTrack[]>([]);
  const iframe = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [library,setLibrary]=useState<ProfileLibrary>({tracks:[],logDays:[]});
  const [profile,setProfile]=useState<ProfileData>(defaultProfile);
  const [userId,setUserId]=useState<string|null>(null);
  const activityRef=useRef<Activity[]>([]);
  const userRef=useRef<string|null>(null);
  const sync=useCallback(()=>{
    const doc=iframe.current?.contentDocument;
    if(!doc)return;
    const buttons=doc.querySelectorAll('nav button');
    const fourth=buttons[3];
    const label=fourth?.querySelector('span');
    if(label&&label.textContent!=='Perfil')label.textContent='Perfil';
    setProfileMode(fourth?.getAttribute('aria-current')==='page');
    try {const raw=JSON.parse(iframe.current?.contentWindow?.localStorage.getItem(LIBRARY_STORAGE_KEY)??'{}');setLibrary({tracks:Array.isArray(raw.tracks)?raw.tracks:[],logDays:Array.isArray(raw.logDays)?raw.logDays:[]});}catch {setLibrary({tracks:[],logDays:[]});}
  },[]);
  useEffect(()=>{
    if(iframe.current?.contentDocument?.readyState==='complete')setReady(true);
    let stopped=false;
    async function load(){const {data}=await supabase.auth.getUser();if(stopped)return;const id=data.user?.id??null;setUserId(id);userRef.current=id;if(!id)return;const {data:row}=await supabase.from('profiles').select('*').eq('id',id).maybeSingle();if(stopped||!row)return;const next={display_name:row.display_name,bio:row.bio,avatar:row.avatar,activity:row.activity as unknown as Activity[],events:row.events as unknown as MusicEvent[]};setProfile(next);activityRef.current=next.activity;}
    void load();
    const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='SIGNED_IN'||event==='USER_UPDATED')void load();if(event==='SIGNED_OUT'){setUserId(null);userRef.current=null;setProfile(defaultProfile);activityRef.current=[];}});
    return()=>{stopped=true;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const doc=iframe.current?.contentDocument;
    if(!doc)return;
    sync();const observer=new MutationObserver(sync);observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-current']});
    function activity(event:Event){const target=event.target as Element|null;if(!target||typeof target.closest!=='function')return;const article=target.closest('article[aria-label]');if(!article)return;const now=new Date();const day=localDay(now);const trackId=article.getAttribute('aria-label')??'';const next=[...activityRef.current.filter(a=>!(a.day===day&&a.trackId===trackId)),{day,hour:now.getHours(),trackId}];activityRef.current=next;setProfile(p=>({...p,activity:next}));const id=userRef.current;if(id)void supabase.from('profiles').update({activity:JSON.parse(JSON.stringify(next))}).eq('id',id).then(()=>{});}
    doc.addEventListener('click',activity);return()=>{observer.disconnect();doc.removeEventListener('click',activity);};
  },[ready,sync]);
  async function saveProfile(next:ProfileData){if(!userId){setProfile(next);activityRef.current=next.activity;return true;}const {error}=await supabase.from('profiles').upsert({id:userId,...next,activity:JSON.parse(JSON.stringify(next.activity)),events:JSON.parse(JSON.stringify(next.events))});if(error)return false;setProfile(next);activityRef.current=next.activity;return true;}
  function activateDJ() {
    try {
      const library = readLibrary(iframe.current?.contentWindow?.localStorage.getItem(LIBRARY_STORAGE_KEY) ?? null);
      const articles = Array.from(iframe.current?.contentDocument?.querySelectorAll('article[aria-label]') ?? []);
      setTracks(library.map(track => {
        if (track.cover) return track;
        const article = articles.find(element => element.getAttribute("aria-label") === `${track.title}, ${track.artist}. Abrir detalhes`);
        const artwork = article?.querySelector("svg");
        if (!artwork) return track;
        const copy = document.importNode(artwork, true);
        copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        return { ...track, cover: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}` };
      }));
    }
    catch { setTracks([]); }
    setDjMode(true);
  }
  function navigate(index:number){const button=iframe.current?.contentDocument?.querySelectorAll<HTMLButtonElement>('nav button')[index];button?.click();sync();}
  return <div className={djMode ? "music-workspace dj-theme" : "music-workspace curation-theme"}>
    {djMode&&<div className="workspace-switch-bar"><div className="workspace-current"><Headphones size={16}/><span>Music Desk <strong>PRO</strong></span></div><Button variant="outline" size="sm" onClick={()=>setDjMode(false)}><ArrowLeft/>Voltar para Curadoria</Button></div>}
    <iframe ref={iframe} src="/music-desk-pro.html" title="Music Desk Pro — Curadoria" className="curation-frame" hidden={djMode||profileMode} onLoad={() => {setReady(true);sync();}} allow="autoplay; microphone; clipboard-write; fullscreen" />
    {!djMode&&profileMode&&<><MusicProfile profile={profile} onSave={saveProfile} library={library} onDJ={activateDJ} signedIn={Boolean(userId)}/><nav className="profile-nav profile-theme" aria-label="Navegação principal">{[{label:'Diário',Icon:Disc3},{label:'Workstation',Icon:SlidersHorizontal},{label:'Setlab',Icon:ListMusic},{label:'Perfil',Icon:UserRound}].map(({label,Icon},i)=><Button variant="ghost" key={label} onClick={()=>navigate(i)} aria-current={i===3?'page':undefined}><Icon size={22}/><span>{label}</span></Button>)}</nav></>}
    {djMode && <DJDesk tracks={tracks} />}
  </div>;
}
