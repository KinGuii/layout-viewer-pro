import { createFileRoute, Link } from "@tanstack/react-router";
import { Disc3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-context";
import { recommendations, releases, type DiscoveryTrack } from "@/lib/discovery";

export const Route = createFileRoute("/descobrir")({
  head: () => ({
    meta: [
      { title: "Descobrir — Music Desk Pro" },
      { name: "description", content: "Lançamentos recentes do seu diário e faixas no radar, prontas para uma segunda escuta." },
      { property: "og:title", content: "Descobrir — Music Desk Pro" },
      { property: "og:description", content: "O que chegou há pouco ao seu diário e o que merece uma segunda escuta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { library, djTracks, openPlayer } = useWorkspace();
  const tracks = library.tracks as unknown as DiscoveryTrack[];
  const covers = new Map(djTracks.map(t => [t.id, t.cover]));
  function open(track: DiscoveryTrack) {
    const audio = track.previewUrl ?? track.audioUrl;
    openPlayer({ id: track.id, title: track.title ?? "", artist: track.artist ?? "", cover: covers.get(track.id) ?? null, ...(typeof audio === "string" && /^https:\/\//.test(audio) ? { audioUrl: audio } : {}) });
  }
  const sections = [
    { id: "releases", title: "Lançamentos", caption: "O que chegou há pouco ao seu diário.", items: releases(tracks) },
    { id: "recommendations", title: "Recomendações", caption: "Ainda no radar, prontas para uma segunda escuta.", items: recommendations(tracks) },
  ];
  return <div className="discover-page profile-theme">
    <header className="discover-heading"><h1>Descobrir</h1><p>Seu acervo, visto de outro ângulo.</p></header>
    {!tracks.length ? <div className="discover-empty"><Disc3 size={30} /><h2>O diário está em branco.</h2><p>Adicione a primeira faixa no Diário para começar a descobrir.</p><Button asChild variant="outline"><Link to="/"><Plus />Ir para o Diário</Link></Button></div>
      : sections.filter(s => s.items.length).map(section => <section key={section.id} className="discover-section" aria-labelledby={`${section.id}-title`}>
        <div className="discover-section-heading"><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.caption}</p></div>
        <ul className="discover-row">{section.items.map(track => <li key={track.id}><Button variant="ghost" className="discover-card" onClick={() => open(track)}>
          <span className="discover-cover">{covers.get(track.id) ? <img src={covers.get(track.id) ?? ""} alt="" /> : <Disc3 size={26} />}</span>
          <strong>{track.title}</strong><small>{track.artist}</small>
        </Button></li>)}</ul>
      </section>)}
  </div>;
}
