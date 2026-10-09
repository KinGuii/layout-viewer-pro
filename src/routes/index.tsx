import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Music Desk Pro" },
      { name: "description", content: "Music Desk Pro — your music workspace." },
      { property: "og:title", content: "Music Desk Pro" },
      { property: "og:description", content: "Music Desk Pro — your music workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/music-desk-pro.html"
      title="Music Desk Pro"
      className="fixed inset-0 h-full w-full border-0"
      allow="autoplay; microphone; clipboard-write; fullscreen"
    />
  );
}
