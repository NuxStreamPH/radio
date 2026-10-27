"use client";

import EmptyState from "@/components/EmptyState";
import StationSection from "@/components/StationSection";
import { useRadio } from "@/components/providers/RadioProvider";
import { STATIONS } from "@/lib/stations";
import { filterStations, groupByCity } from "@/lib/filter";

/* Ported `stations` branch of renderContent(): cards grouped by city. */

export default function StationsView() {
  const { query, filter } = useRadio();

  const list = filterStations(STATIONS, query, filter);
  const groups = groupByCity(list);

  if (!groups.length) {
    return (
      <EmptyState
        icon="radio"
        title="No stations found"
        sub={
          query ? `Nothing matches “${query}”.` : "Try a different filter."
        }
      />
    );
  }

  return (
    <>
      {groups.map(([city, l]) => (
        <StationSection key={city} title={city} list={l} wrap={l.length < 4} />
      ))}
    </>
  );
}
