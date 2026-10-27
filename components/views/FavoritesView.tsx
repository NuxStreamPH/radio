"use client";

import EmptyState from "@/components/EmptyState";
import StationSection from "@/components/StationSection";
import { useRadio } from "@/components/providers/RadioProvider";
import { STATIONS } from "@/lib/stations";
import { filterStations } from "@/lib/filter";

/* Ported `favorites` branch of renderContent(). */

export default function FavoritesView() {
  const { favorites, query, filter } = useRadio();

  const favList = filterStations(STATIONS, query, filter).filter((s) =>
    favorites.has(s.id),
  );

  return favList.length ? (
    <StationSection title="Your favorites" list={favList} wrap />
  ) : (
    <EmptyState
      icon="heart"
      title="No favorites yet"
      sub="Tap the heart on any station to save it here."
    />
  );
}
