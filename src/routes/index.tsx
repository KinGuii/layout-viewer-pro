import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diário — Music Desk Pro" },
      { name: "description", content: "Seu diário musical: faixas, micro-reviews sensoriais e acervo pessoal, com DJ Desk, Descobrir e Perfil." },
      { property: "og:title", content: "Diário — Music Desk Pro" },
      { property: "og:description", content: "Um diário e catálogo musical independente, com micro-reviews e acervo pessoal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  // The Diário itself is the original app, kept mounted by the workspace shell.
  component: () => null,
});
