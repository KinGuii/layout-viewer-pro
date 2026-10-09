import { createFileRoute } from "@tanstack/react-router";
import { MusicWorkspace } from "@/components/music-workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Music Desk Pro — Curadoria & DJ Desk" },
      { name: "description", content: "Seu diário musical e acervo profissional, com DJ Desk e radar de transições por BPM e harmonia." },
      { property: "og:title", content: "Music Desk Pro — Curadoria & DJ Desk" },
      { property: "og:description", content: "Alterne entre Curadoria e DJ Desk e encontre transições compatíveis no seu acervo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <MusicWorkspace />;
}
