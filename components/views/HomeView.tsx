"use client";

import StationSection from "@/components/StationSection";
import { useRadio } from "@/components/providers/RadioProvider";
import { STATIONS } from "@/lib/stations";
import { filterStations } from "@/lib/filter";
import { useMounted } from "@/lib/use-mounted";

/* Ported greeting() — gated behind hydration (useMounted) so the SSR markup
   can't mismatch the visitor's local time zone. */
function greeting(): string {
  const h = new Date().getHours();
  return h < 12
    ? "Good morning!"
    : h < 18
      ? "Good afternoon!"
      : "Good evening!";
}

export default function HomeView() {
  const { favorites, recent, query, filter } = useRadio();
  const mounted = useMounted();

  const list = filterStations(STATIONS, query, filter);
  const recList = list
    .filter((s) => recent.includes(s.id))
    .sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
  const favList = list.filter((s) => favorites.has(s.id));

  return (
    <>
      {/*<h1 className="mb-1 text-2xl font-bold text-white">
        {mounted ? greeting() : ""}
      </h1>
      <p className="mb-6 text-sm text-neutral-400">
        Here are available livestreams!
      </p>*/}
      {recList.length > 0 && (
        <StationSection title="Continue listening" list={recList} wrap />
      )}
      {favList.length > 0 && (
        <StationSection title="Your favorites" list={favList} wrap />
      )}
      <StationSection title="Live now" list={list} wrap />
    </>
  );
}
