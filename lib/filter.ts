import type { Station } from "./stations";

/* Ported from the original filteredStations() + groupByCity() helpers. */

export function filterStations(
  list: Station[],
  query: string,
  filter: string,
): Station[] {
  let out = list;

  const q = query.trim().toLowerCase();
  if (q) {
    out = out.filter((s) =>
      `${s.name} ${s.tagline} ${s.genre} ${s.city} ${s.region}`
        .toLowerCase()
        .includes(q),
    );
  }

  if (filter === "All The Hits")
    out = out.filter((s) => /top 40|hits/i.test(s.genre));
  if (filter === "OPM") out = out.filter((s) => /opm/i.test(s.genre));
  if (filter === "Manila") out = out.filter((s) => /manila/i.test(s.region));

  return out;
}

export function groupByCity(list: Station[]): [string, Station[]][] {
  const m = new Map<string, Station[]>();
  list.forEach((s) => {
    if (!m.has(s.city)) m.set(s.city, []);
    m.get(s.city)!.push(s);
  });
  return [...m.entries()];
}
