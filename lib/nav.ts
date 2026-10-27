import type { Route } from "next";

/* Maps between the original in-memory "views" and App Router paths. */

export type View =
  | "home"
  | "stations"
  | "station"
  | "podcasts"
  | "favorites"
  | "recent";

const VIEW_PATHS: Record<string, string> = {
  home: "/home",
  stations: "/stations",
  podcasts: "/podcasts",
  favorites: "/favorites",
  recent: "/recent",
};

export function pathForView(view: string, stationId?: number | null): Route {
  if (view === "station") return stationPath(stationId ?? 0);
  return (VIEW_PATHS[view] ?? "/stations") as Route;
}

export function stationPath(id: number): Route {
  return `/station/${id}` as Route;
}

export function viewForPath(pathname: string): View {
  if (pathname.startsWith("/station/")) return "station";
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/podcasts")) return "podcasts";
  if (pathname.startsWith("/favorites")) return "favorites";
  if (pathname.startsWith("/recent")) return "recent";
  return "stations"; // "/" and "/stations"
}

/* Which bottom tab is highlighted for a given view (ported 1:1 from the
   original `tabFor` helper). */
export function tabFor(v: View): string {
  return (["stations", "podcasts", "favorites", "profile"] as string[]).includes(
    v,
  )
    ? v
    : v === "recent"
      ? "profile"
      : "home";
}
