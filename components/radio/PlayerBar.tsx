"use client";

import { Icon, PauseIcon, PlayIcon } from "@/components/Icons";
import StationArt from "@/components/StationArt";
import { useRadio } from "@/components/providers/RadioProvider";
import { STATIONS } from "@/lib/stations";
import { cn } from "@/lib/utils";

/* ============ FULL-WIDTH PLAYER BAR ============ */
/* Anchored to the viewport edges, then inset with margins that mirror the
   main panel (sidebar 16rem + gap on desktop; tab bar + safe area on mobile)
   so it always lines up with the content column. */

export default function PlayerBar() {
  const {
    playing,
    paused,
    buffering,
    pbMin,
    muted,
    volume,
    togglePlay,
    stepStation,
    stopStream,
    togglePbMin,
    toggleMute,
    setVolume,
    shareStation,
  } = useRadio();

  const s = STATIONS.find((x) => x.id === playing);

  return (
    <div
      id="playerBar"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 transition-all duration-300",
        !s && "pointer-events-none translate-y-32 opacity-0",
      )}
    >
      <div className="pointer-events-auto mx-3 mb-[calc(4.75rem+env(safe-area-inset-bottom))] rounded-2xl border border-white/10 bg-neutral-900/90 p-3 shadow-2xl shadow-black/70 backdrop-blur-xl lg:mx-0 lg:ml-[16.75rem] lg:mr-3 lg:mb-3">
        {s && (
          <div className="flex items-center gap-3">
            {/* left: art + titles */}
            <div className="flex min-w-0 items-center gap-3 lg:w-64">
              <StationArt
                station={s}
                size="h-11 w-11 rounded-lg"
                className={cn(buffering && !paused && "animate-pulse")}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">
                  {s.shorthand || s.tagline}
                </p>
                <p className="truncate text-xs text-neutral-400">
                  {`${s.name}${
                    buffering && !paused
                      ? " · Buffering…"
                      : paused
                        ? " · Paused"
                        : " · Live"
                  }`}
                </p>
              </div>
            </div>

            {/* center: controls + live bar */}
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1.5",
                pbMin && "hidden",
              )}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => stepStation(-1)}
                  aria-label="Previous station"
                  className="hidden rounded-full p-1.5 text-neutral-300 transition hover:bg-white/10 hover:text-white sm:block"
                >
                  <Icon name="prev" className="h-4 w-4" />
                </button>
                <button
                  onClick={() => playing != null && togglePlay(playing)}
                  aria-label="Play / pause"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 hover:bg-neutral-200"
                >
                  {paused ? (
                    <PlayIcon className="h-5 w-5" />
                  ) : (
                    <PauseIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => stepStation(1)}
                  aria-label="Next station"
                  className="hidden rounded-full p-1.5 text-neutral-300 transition hover:bg-white/10 hover:text-white sm:block"
                >
                  <Icon name="next" className="h-4 w-4" />
                </button>
              </div>
              <div className="flex w-full max-w-xs flex-col items-center gap-0.5">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <div className="absolute inset-y-0 left-0 w-1/4 animate-slide rounded-full bg-white/90"></div>
                </div>
                <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-500">
                  LIVE
                </span>
              </div>
            </div>

            {/* right: share / volume / stop / minimize */}
            <div className="flex items-center gap-1 lg:w-64 lg:justify-end">
              <button
                onClick={() => shareStation(s)}
                aria-label="Share"
                className={cn(
                  "rounded-full p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white",
                  pbMin && "hidden",
                )}
              >
                <Icon name="share" className="h-4 w-4" />
              </button>
              <button
                onClick={toggleMute}
                aria-label="Mute"
                className="hidden rounded-full p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white sm:block"
              >
                <Icon
                  name={muted || volume === 0 ? "volX" : "vol"}
                  className="h-4 w-4"
                />
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="hidden h-1 w-20 cursor-pointer accent-nux-400 sm:block"
              />
              <button
                onClick={stopStream}
                aria-label="Stop"
                className={cn(
                  "rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white",
                  pbMin && "hidden",
                )}
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
              <button
                onClick={togglePbMin}
                aria-label="Minimize player"
                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name={pbMin ? "chevR" : "chevD"} className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
