"use client";

import EmptyState from "@/components/EmptyState";

/* Ported `podcasts` branch of renderContent(). */

export default function PodcastsView() {
  return (
    <EmptyState
      icon="podcast"
      title="Podcasts coming soon"
      sub="Your favorite shows will live here."
    />
  );
}
