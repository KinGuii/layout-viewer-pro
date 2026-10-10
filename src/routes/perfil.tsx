import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MusicProfile } from "@/components/music-profile";
import { useWorkspace } from "@/components/workspace-context";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil Musical — Music Desk Pro" },
      { name: "description", content: "Sua identidade musical: avatar, ofensiva, conquistas, desafios, curiosidade diária e shows." },
      { property: "og:title", content: "Perfil Musical — Music Desk Pro" },
      { property: "og:description", content: "Identidade, frequência de escuta, XP e cartão de Stories do seu Music Desk." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const w = useWorkspace();
  const navigate = useNavigate();
  return <MusicProfile profile={w.profile} onSave={w.saveProfile} library={w.library} onDJ={() => navigate({ to: "/dj" })} onHome={() => navigate({ to: "/" })} signedIn={w.signedIn} engagement={w.engagement} onSymbol={w.setSymbol} onMission={w.award} />;
}
