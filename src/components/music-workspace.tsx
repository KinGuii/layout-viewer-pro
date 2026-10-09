import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRightLeft, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DJDesk } from "@/components/dj-desk";
import { LIBRARY_STORAGE_KEY, readLibrary, type DJTrack } from "@/lib/dj-library";

export function MusicWorkspace() {
  const [djMode, setDjMode] = useState(false);
  const [tracks, setTracks] = useState<DJTrack[]>([]);
  const iframe = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (iframe.current?.contentDocument?.readyState === "complete") setReady(true);
  }, []);
  function activateDJ() {
    try { setTracks(readLibrary(iframe.current?.contentWindow?.localStorage.getItem(LIBRARY_STORAGE_KEY) ?? null)); }
    catch { setTracks([]); }
    setDjMode(true);
  }
  return <div className={djMode ? "music-workspace dj-theme" : "music-workspace curation-theme"}>
    <div className="workspace-switch-bar"><div className="workspace-current"><Headphones size={16} /><span>Music Desk <strong>PRO</strong></span><i /><span className="workspace-mode-label">{djMode ? "DJ Desk" : "Curadoria"}</span></div><Button variant={djMode ? "outline" : "default"} size="sm" disabled={!ready} onClick={() => djMode ? setDjMode(false) : activateDJ()}>{djMode ? <ArrowLeft /> : <ArrowRightLeft />}{djMode ? "Voltar para Curadoria" : "Ativar DJ Desk"}</Button></div>
    <iframe ref={iframe} src="/music-desk-pro.html" title="Music Desk Pro — Curadoria" className="curation-frame" hidden={djMode} onLoad={() => setReady(true)} allow="autoplay; microphone; clipboard-write; fullscreen" />
    {djMode && <DJDesk tracks={tracks} />}
  </div>;
}