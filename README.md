# NuxStream Radio 📻 — Next.js

Live FM streams from across the Philippines.

This is a **Next.js (App Router) conversion** of the single-file
`code-possible-deployment.html` prototype. The UI, markup classes, copy and
behaviour were ported 1:1; the vanilla-JS state/render engine was restructured
into idiomatic React + Next.js.

## Stack

| Concern          | Original (single HTML file)        | This project                                        |
| ---------------- | ---------------------------------- | --------------------------------------------------- |
| Framework        | none (one `.html` file)            | **Next.js 16** (App Router) + **React 19** + **TS** |
| Styling          | Tailwind v4 **browser CDN**        | Tailwind v4 build (`@tailwindcss/postcss`)          |
| Theme/utilities  | inline `<style type="text/tailwindcss">` | `app/globals.css` (`@theme` / `@utility`)     |
| Font             | `<link>` to Google Fonts           | `next/font/google` (self-hosted at build time)      |
| State + audio    | global `state` object + `render()` | `RadioProvider` client context (audio engine, favorites, recent, volume, history stack, toasts) |
| "Views"          | in-memory `state.view` switch      | real routes (see below)                             |
| Persistence      | `localStorage` (`pinoyradio:*`)    | same keys via `lib/store.ts` (volume + mute)        |

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

> Note: `next build` uses Turbopack by default. In very memory-constrained
> environments (< ~1 GB RAM) it can get OOM-killed; `npx next build --webpack`
> works there (this is how the project was verified).

## Routes ↔ original views

| Route            | Original `state.view` | Notes                                        |
| ---------------- | --------------------- | -------------------------------------------- |
| `/`              | —                     | redirects to `/stations` (the original boots into "All Stations") |
| `/stations`      | `stations`            | cards grouped by city, filter pills, search  |
| `/home`          | `home`                | greeting + Continue listening / Favorites / Live now |
| `/station/[id]`  | `station`             | hero, Recently Played, DJ Bios **or** Station Information |
| `/podcasts`      | `podcasts`            | "coming soon" empty state                    |
| `/favorites`     | `favorites`           | reachable by URL (no nav entry, same as original) |
| `/recent`        | `recent`              | reachable by URL (no nav entry, same as original) |
| unknown id       | —                     | themed 404 page (original fell back to the first station) |

## Project structure

```
app/
  layout.tsx            root layout: font, metadata, RadioProvider + AppShell
  globals.css           Tailwind v4 theme (fonts, eq/slide keyframes, no-scrollbar)
  page.tsx              "/" → redirect("/stations")
  stations|home|podcasts|favorites|recent/page.tsx
  station/[id]/page.tsx validates id against lib/stations.ts (404 otherwise)
  not-found.tsx
components/
  providers/RadioProvider.tsx   audio engine + global state + in-app history
  radio/                        AppShell, Sidebar, MobileHeader, FilterPills,
                                BottomTabs, PlayerBar, Toast
  views/                        HomeView, StationsView, StationView,
                                PodcastsView, FavoritesView, RecentView
  Icons.tsx                     ported SVG path map (P) + Icon/Play/Pause/…
  StationArt.tsx                gradient artwork + icon w/ fallback
  StationCard.tsx               ported cardHTML()
  StationSection.tsx            ported sectionHTML() (rows, scroll arrows, show more)
  EmptyState.tsx                ported emptyState()
lib/
  stations.ts                   STATIONS / FILTERS / NAV_MAIN / TABS + types
  store.ts                      localStorage wrapper ("pinoyradio:" prefix)
  filter.ts                     filterStations() + groupByCity()
  nav.ts                        view ↔ path mapping, tabFor()
  use-mounted.ts                hydration gate via useSyncExternalStore
  utils.ts                      cn() class joiner
```

### Porting map (original → here)

- `state` object, audio element + event wiring, `showToast`, `shareStation`,
  `pushNav/goHist/applyNav`, `document.title` logic → **`RadioProvider`**
- `renderNav/renderTabs/renderPills/renderPlayer/renderSign` → **Sidebar /
  BottomTabs / FilterPills / PlayerBar**
- `renderContent` branches → **`components/views/*`** (one per route)
- delegated `[data-*]` click handlers → per-component `onClick` props
  (`stopPropagation` reproduces the original `closest()` precedence)
- global `keydown` (Escape = close search / stop stream, Space = play/pause) →
  `AppShell`
- `#content` scroll-to-top on view change → `AppShell` effect on `pathname`

## Intentional deviations (improvements the port enables)

1. **Share** now shares the station's own deep link (`/station/{id}`) instead
   of the current page URL (the original had only one URL).
2. **Favorite heart color**: the original used `!text-blue-400`, which Tailwind
   v4 no longer supports (important moved to the suffix), so the rule silently
   did nothing. Here it's `text-blue-400!` and the favorite heart renders blue
   as intended.
3. **Broken icon fallback**: the original's `onerror` removed a `hidden` class
   that was never applied, leaving the fallback text invisible (sr-only). Here
   the `short` label actually shows when a station icon fails to load.
4. **Invalid gradient stop kept as-is**: Smile Radio's `to-gold-600` is not a
   Tailwind color; like the original it's simply ignored (orange → transparent
   fade). Fix it in `lib/stations.ts` if you want a real second stop.
5. Removed dead code: the `data-nav="signin"` toggle (no such button existed)
   and the stray `</>` typo in the sidebar's Debug Details block.
6. Time-dependent strings (greeting, "Recently Played" clock labels) are gated
   behind hydration (`useMounted`) to avoid SSR/client mismatches.

## Faithful quirks kept on purpose

- Favorites / recents are **not** persisted across reloads (only volume and
  mute are, under `pinoyradio:*`) — same as the original.
- Station detail highlights the **Home** bottom tab (`tabFor("station")`).
- On minimize, mute/volume stay visible ≥ 640px (the original's `hidden`
  toggle loses to `sm:block`).
- Starting playback while muted keeps the audio muted (`state.muted` resets but
  `audio.volume` doesn't) — ported as-is.
- `document.title` flips to `▶ {name} · NuxStream Radio` while playing.

## Stream notes

- Streams are played with a plain `HTMLAudioElement` (live Icecast/HLS-less
  endpoints); buffering/stall/error events drive the UI spinners and toasts.
- An `http://` stream will be blocked by browsers when the app is served over
  HTTPS (mixed content). The error toast mentions this case, same as the
  original. All three bundled streams are currently `https://`.
