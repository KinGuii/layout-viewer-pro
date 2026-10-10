import { createFileRoute } from "@tanstack/react-router";
import { DJDesk } from "@/components/dj-desk";
import { useWorkspace } from "@/components/workspace-context";

export const Route = createFileRoute("/dj")({
  head: () => ({
    meta: [
      { title: "DJ Desk — Music Desk Pro" },
      { name: "description", content: "Biblioteca técnica, radar de transição por BPM e harmonia Camelot e sets do seu acervo." },
      { property: "og:title", content: "DJ Desk — Music Desk Pro" },
      { property: "og:description", content: "Seu acervo em modo DJ: BPM, tom, energia, radar de transição e papéis no set." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DJPage,
});

function DJPage() {
  const { djTracks, openPlayer } = useWorkspace();
  return <DJDesk tracks={djTracks} onSelect={track => openPlayer({ id: track.id, title: track.title, artist: track.artist, cover: track.cover })} />;
}
