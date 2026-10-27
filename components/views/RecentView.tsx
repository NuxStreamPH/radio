"use client";

import EmptyState from "@/components/EmptyState";
import StationSection from "@/components/StationSection";
import { useRadio } from "@/components/providers/RadioProvider";
import { STATIONS } from "@/lib/stations";
import { filterStations } from "@/lib/filter";

/* Ported `recent` branch of renderContent(). */

export default function RecentView() {
  const { recent, query, filter } = useRadio();

  const recList = filterStations(STATIONS, query, filter)
    .filter((s) => recent.includes(s.id))
    .sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));

  return recList.length ? (
    <StationSection title="Recently played" list={recList} wrap />
  ) : (
    <EmptyState
      icon="history"
      title="Nothing played yet"
      sub="Stations you listen to will appear here."
    />
  );
}
