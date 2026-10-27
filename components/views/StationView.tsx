"use client";

import { Fragment } from "react";
import { Icon, PauseIcon, PlayIcon, Spinner } from "@/components/Icons";
import StationArt from "@/components/StationArt";
import { useRadio } from "@/components/providers/RadioProvider";
import { STATIONS, type Station } from "@/lib/stations";
import { stationPath } from "@/lib/nav";
import { useMounted } from "@/lib/use-mounted";

/* Ported renderStation(): hero + Recently Played + (DJ Bios | Station
   Information). A station with an empty `djs` array renders the "Station
   Information" section instead of DJ Bios. */

function formatOwner(owner?: string | string[]): string {
  if (!owner) return "Independent";
  if (Array.isArray(owner)) {
    if (owner.length > 1)
      return `${owner.slice(0, -1).join(", ")} and ${owner.at(-1)}`;
    return owner[0] ?? "Independent";
  }
  return owner;
}

/* "Recently Played" timestamps are relative to *now* by design (ported from
   the original, which recomputed them on every render). Callers gate this
   behind useMounted() so SSR and hydration markup stay deterministic. */
function minutesAgoLabel(mins: number): string {
  return new Date(Date.now() - mins * 6e4).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StationView({ station: s }: { station: Station }) {
  const {
    playing,
    paused,
    buffering,
    recent,
    expanded,
    toggleExpanded,
    togglePlay,
    goHist,
    canBack,
    canForward,
    shareStation,
    navigate,
  } = useRadio();

  /* time-based values are gated behind hydration (useMounted) to avoid
     SSR/client hydration mismatches */
  const mounted = useMounted();

  const isPlaying = playing === s.id && !paused;
  const isLoading = playing === s.id && buffering && !paused;
  const rpExp = expanded.has("RP:" + s.id);
  const djExp = expanded.has("DJ:" + s.id);
  const hasDjs = Array.isArray(s.djs) && s.djs.length > 0;

  /* recently played timeline entries */
  const rp: { station: Station; title: string; time: string }[] = [
    { station: s, title: s.tagline, time: "Now" },
  ];
  const pool: (Station | undefined)[] = [
    ...recent
      .filter((id) => id !== s.id)
      .map((id) => STATIONS.find((x) => x.id === id)),
    ...STATIONS.filter((x) => x.id !== s.id),
  ];
  pool.forEach((st, i) => {
    if (rp.length < 4 && st && !rp.some((e) => e.station.id === st.id)) {
      rp.push({
        station: st,
        title: st.tagline,
        time: mounted ? minutesAgoLabel((i + 1) * 2) : "",
      });
    }
  });
  const rpRow = rpExp
    ? "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
    : "flex gap-3 overflow-x-auto no-scrollbar pb-1";

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10">
        {/* blurred art backdrop */}
        <div className={`absolute inset-0 ${s.bg}`}></div>
        {s.icon && (
          <div
            className="absolute inset-0 scale-150 bg-cover bg-center opacity-60 blur-2xl"
            style={{ backgroundImage: `url('${s.icon}')` }}
          ></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-neutral-950/10"></div>
        <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-nux-500/20 blur-3xl"></div>

        {/* top bar */}
        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goHist(-1)}
              disabled={!canBack}
              aria-label="Back"
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-30"
            >
              <Icon name="chevL" className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => goHist(1)}
              disabled={!canForward}
              aria-label="Forward"
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-30"
            >
              <Icon name="chevR" className="h-4.5 w-4.5" />
            </button>
          </div>
          <button
            onClick={() => shareStation(s)}
            className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"
          >
            <Icon name="share" className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* hero content */}
        <div className="relative flex flex-col items-center gap-6 px-6 pb-10 pt-2 sm:flex-row sm:items-end sm:gap-8 sm:px-10">
          <StationArt
            station={s}
            size="h-36 w-36 rounded-2xl shadow-2xl shadow-black/60 sm:h-44 sm:w-44"
          />
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
              {s.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-300 sm:justify-start">
              <span>{s.genre}</span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                {s.city}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-bold text-red-400 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 [box-shadow:0_0_8px_rgba(239,68,68,1)]"></span>
                Live
              </span>
            </p>
            <button
              onClick={() => togglePlay(s.id)}
              title={`${isPlaying ? "Pause" : "Play"} ${s.name}`}
              className="mt-6 grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-2xl shadow-black/50 transition hover:scale-105 hover:bg-neutral-200"
            >
              {isLoading ? (
                <Spinner className="h-6 w-6" />
              ) : isPlaying ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Recently Played */}
      <section className="mb-9">
        <div className="mb-3 flex items-center">
          <h2 className="flex-1 text-lg font-bold text-neutral-200">
            Recently Played
          </h2>
          <button
            onClick={() => toggleExpanded("RP:" + s.id)}
            className="px-2 py-1 text-sm font-semibold text-nux-500 transition hover:text-nux-300"
          >
            {rpExp ? "Show less" : "Show more"}
          </button>
        </div>
        <div className={`row ${rpRow}`}>
          {rp.map((e) => (
            <button
              key={e.station.id}
              onClick={() => navigate(stationPath(e.station.id))}
              className="flex min-w-[280px] flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-3 text-left backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[.08]"
            >
              <StationArt station={e.station} size="h-11 w-11" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">
                  {e.title}
                </span>
                <span className="block truncate text-xs text-neutral-400">
                  {e.station.name}
                </span>
              </span>
              {e.time === "Now" ? (
                <span className="shrink-0 rounded-full bg-nux-500 px-2.5 py-1 text-[11px] font-bold text-black">
                  Now
                </span>
              ) : (
                <span className="shrink-0 pr-1 text-xs text-neutral-500">
                  {e.time}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {hasDjs ? (
        /* DJ Bios section (only when the station actually has DJs) */
        <section className="mb-4">
          <div className="mb-3 flex items-center">
            <h2 className="flex-1 text-lg font-bold text-neutral-200">
              DJ Bios
            </h2>
            <button
              onClick={() => toggleExpanded("DJ:" + s.id)}
              className="px-2 py-1 text-sm font-semibold text-nux-500 transition hover:text-nux-300"
            >
              {djExp ? "Show less" : "Show more"}
            </button>
          </div>
          <div className="row flex flex-wrap gap-4">
            {s.djs.map((d) => (
              <div
                key={d.name}
                className={`grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br p-[3px] ${d.grad} shadow-xl shadow-black/40`}
              >
                <div className="grid h-full w-full place-items-center rounded-full bg-neutral-900/80 p-3 text-center backdrop-blur">
                  <span className="text-sm font-bold leading-tight text-white">
                    {d.name.split(" ").map((part, i) => (
                      <Fragment key={i}>
                        {i > 0 && <br />}
                        {part}
                      </Fragment>
                    ))}
                  </span>
                </div>
              </div>
            ))}
            <div className="min-w-[240px] flex-1 rounded-2xl border border-white/10 bg-white/[.05] p-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-white">{s.tagline}</p>
              <p className="mt-1 text-xs text-neutral-400">
                {djExp
                  ? s.djs
                      .map((d) => `${d.name} hosts "${d.show}" — ${d.bio}`)
                      .join(" ")
                  : `${s.tagline} ${s.genre} broadcasting 24/7 from ${s.city}, Philippines. 🇵🇭`}
              </p>
            </div>
          </div>
          {djExp && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {s.djs.map((d) => (
                <div
                  key={d.name}
                  className="rounded-2xl border border-white/10 bg-white/[.04] p-4"
                >
                  <p className="text-sm font-bold text-white">
                    {d.name}{" "}
                    <span className="font-normal text-neutral-400">
                      · {d.show}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    {d.bio}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Station Information (shown instead of DJ Bios when the station has no DJs) */
        <section className="mb-4">
          <div className="mb-3 flex items-center">
            <h2 className="flex-1 text-lg font-bold text-neutral-200">
              Station Information
            </h2>
          </div>

          {/* Slogan header */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <div className={`absolute inset-0 ${s.bg} opacity-30`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/55 to-transparent"></div>
            <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-nux-500/20 blur-3xl"></div>
            <div className="relative px-6 py-8 sm:px-10 sm:py-10">
              <h3 className="text-3xl font-bold italic tracking-tight text-white drop-shadow-lg sm:text-4xl">
                “{s.tagline}”
              </h3>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-nux-400">
                Station Slogan · {s.name}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4 backdrop-blur-sm sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                About
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
                {s.description ||
                  `${s.name} broadcasts live from ${s.city}, Philippines.`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Owner / Operator
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {formatOwner(s.owner)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Broadcast Info
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {s.city}
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">
                {s.region} · {s.genre} · On air 24/7 🇵🇭
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
