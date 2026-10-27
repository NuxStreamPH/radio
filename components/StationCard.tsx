"use client";

import {
  HeartFilled,
  Icon,
  PauseIcon,
  PlayIcon,
  Spinner,
} from "@/components/Icons";
import StationArt from "./StationArt";
import { useRadio } from "@/components/providers/RadioProvider";
import type { Station } from "@/lib/stations";
import { stationPath } from "@/lib/nav";

/* Ported cardHTML() */

export default function StationCard({ station: s }: { station: Station }) {
  const {
    playing,
    paused,
    buffering,
    favorites,
    compact,
    togglePlay,
    toggleFav,
    navigate,
  } = useRadio();

  const isPlaying = playing === s.id && !paused;
  const isLoading = playing === s.id && buffering && !paused;
  const fav = favorites.has(s.id);

  return (
    <article
      onClick={() => navigate(stationPath(s.id))}
      className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 backdrop-blur-sm transition-all duration-200 sm:min-w-[300px] sm:flex-1 ${
        isPlaying
          ? "border-nux-400/60 bg-white/[.09] shadow-nux-500/50"
          : "border-white/10 bg-white/[.05] shadow-nux-500/50 hover:border-white/25 hover:bg-white/[.08] hover:shadow-nux-500/50"
      }`}
    >
      <StationArt station={s} size={compact ? "h-10 w-10" : "h-14 w-14"} />
      <div className="min-w-0 flex-1">
        <h3
          className={`truncate font-bold text-white ${
            compact ? "text-sm" : "text-[15px]"
          }`}
        >
          {s.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-neutral-400">
          {s.shorthand || s.tagline}
        </p>
        <p className="truncate text-[11px] text-neutral-500">{s.city}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFav(s.id);
        }}
        title="Favorite"
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 opacity-100 transition hover:text-nux-400 lg:opacity-0 lg:group-hover:opacity-100 ${
          fav ? "text-nux-400! lg:opacity-100" : ""
        }`}
      >
        {fav ? <HeartFilled /> : <Icon name="heart" className="h-4 w-4" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay(s.id);
        }}
        title={`${isPlaying ? "Pause" : "Play"} ${s.name}`}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
          isPlaying
            ? "border-nux-500 bg-nux-400/10 text-nux-400 shadow-nux-500/50"
            : "border-white/25 bg-white/10 text-white hover:scale-105 hover:border-white/60 hover:bg-white/20"
        }`}
      >
        {isLoading ? <Spinner /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </article>
  );
}
