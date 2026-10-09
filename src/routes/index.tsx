import { createFileRoute } from "@tanstack/react-router";
import { MusicWorkspace } from "@/components/music-workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Music Desk Pro — Diário, Perfil Musical & DJ Desk" },
      { name: "description", content: "Seu diário e perfil musical pessoal: identidade, frequência de escuta, curiosidades, shows e DJ Desk com radar de transições." },
      { property: "og:title", content: "Music Desk Pro — Diário, Perfil Musical & DJ Desk" },
      { property: "og:description", content: "Sua identidade musical, hábitos e shows em um só Perfil, com acesso ao DJ Desk e ao seu acervo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <MusicWorkspace />;
}
