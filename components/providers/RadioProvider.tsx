"use client";

/* ------------------------------------------------------------------ */
/* RadioProvider — the ported "brain" of the original single-file app: */
/* app-wide state object, HTMLAudio engine, localStorage persistence,  */
/* in-app history stack, toasts and sharing.                           */
/* ------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { STATIONS, type Station } from "@/lib/stations";
import { store } from "@/lib/store";

/* ---------------- state shape ---------------- */

interface HistEntry {
  path: string;
}

interface RadioState {
  playing: number | null;
  paused: boolean;
  buffering: boolean;
  favorites: Set<number>;
  recent: number[];
  expanded: Set<string>;
  compact: boolean;
  pbMin: boolean;
  muted: boolean;
  /** mirrors audio.volume (0..1) */
  volume: number;
  /** last non-zero volume, used to restore on unmute */
  lastVol: number;
  query: string;
  filter: string;
  /* in-app history (ported from state.hist / state.hIdx) */
  hist: HistEntry[];
  hIdx: number;
}

export interface ToastState {
  msg: string;
  isErr: boolean;
  visible: boolean;
}

interface RadioContextValue extends RadioState {
  canBack: boolean;
  canForward: boolean;
  toast: ToastState;
  navigate: (path: Route, opts?: { replace?: boolean }) => void;
  goHist: (dir: number) => void;
  playStation: (id: number) => void;
  togglePlay: (id: number) => void;
  stopStream: () => void;
  stepStation: (dir: number) => void;
  toggleMute: () => void;
  /** slider input, 0..100 */
  setVolume: (v: number) => void;
  togglePbMin: () => void;
  toggleFav: (id: number) => void;
  toggleExpanded: (key: string) => void;
  setQuery: (q: string) => void;
  setFilter: (f: string) => void;
  showToast: (msg: string, isErr?: boolean) => void;
  shareStation: (s: Station) => Promise<void>;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadio(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio() must be used inside <RadioProvider>");
  return ctx;
}

/* ---------------- provider ---------------- */

export default function RadioProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<RadioState>(() => ({
    playing: null,
    paused: false,
    buffering: false,
    favorites: new Set<number>(),
    recent: [],
    expanded: new Set<string>(),
    compact: false,
    pbMin: false,
    muted: false,
    volume: 0.9,
    lastVol: 0.9,
    query: "",
    filter: "All Stations",
    hist: [{ path: pathname }],
    hIdx: 0,
  }));

  /* Ref mirror of the latest state so audio event listeners and back-to-back
     actions always read fresh values — mirrors the original's single mutable
     `state` object. */
  const stateRef = useRef(state);
  const update = useCallback((fn: (s: RadioState) => RadioState) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  /* ---------------- toast ---------------- */

  const [toast, setToast] = useState<ToastState>({
    msg: "",
    isErr: false,
    visible: false,
  });

  const showToast = useCallback((msg: string, isErr = false) => {
    setToast({ msg, isErr, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      4000,
    );
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  /* ---------------- audio engine ---------------- */

  const stopStream = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    update((s) => ({ ...s, playing: null, paused: false, buffering: false }));
  }, [update]);

  const playStation = useCallback(
    (id: number) => {
      const s = STATIONS.find((x) => x.id === id);
      const audio = audioRef.current;
      if (!s || !audio) return;
      update((st) => ({
        ...st,
        playing: id,
        paused: false,
        buffering: true,
        muted: false,
        recent: [id, ...st.recent.filter((x) => x !== id)].slice(0, 10),
      }));
      audio.src = s.stream;
      audio.play().catch(() => {
        /* autoplay blocked / stream error — handled via audio events */
      });
    },
    [update],
  );

  const togglePlay = useCallback(
    (id: number) => {
      const audio = audioRef.current;
      const st = stateRef.current;
      if (st.playing === id && audio) {
        if (st.paused) {
          audio.play().catch(() => {});
          update((s) => ({ ...s, paused: false }));
        } else {
          audio.pause();
          update((s) => ({ ...s, paused: true }));
        }
        return;
      }
      playStation(id);
    },
    [playStation, update],
  );

  const stepStation = useCallback(
    (dir: number) => {
      const st = stateRef.current;
      if (st.playing == null) {
        if (STATIONS.length) playStation(STATIONS[0].id);
      } else {
        const i = STATIONS.findIndex((x) => x.id === st.playing);
        playStation(STATIONS[(i + dir + STATIONS.length) % STATIONS.length].id);
      }
    },
    [playStation],
  );

  /* create the audio element + wire events once on mount (client only) */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    /* restore last volume + mute state */
    const savedVol = Math.min(
      1,
      Math.max(0, Number(store.get("volume", 0.9))) || 0.9,
    );
    const savedMuted = !!store.get("muted", false);
    audio.volume = savedMuted ? 0 : savedVol;
    update((s) => ({
      ...s,
      volume: audio.volume,
      lastVol: savedVol,
      muted: savedMuted,
    }));

    const onBuffering = () => update((s) => ({ ...s, buffering: true }));
    const onPlaying = () =>
      update((s) => ({ ...s, buffering: false, paused: false }));
    const onPause = () =>
      update((s) => (s.playing && !s.paused ? { ...s, paused: true } : s));
    const onError = () => {
      const st = stateRef.current;
      const s = STATIONS.find((x) => x.id === st.playing);
      stopStream();
      if (s) {
        showToast(
          `Can't reach ${s.name}'s stream${
            location.protocol === "https:" && s.stream.startsWith("http:")
              ? " (http blocked on https page)"
              : ""
          }`,
          true,
        );
      }
    };

    audio.addEventListener("waiting", onBuffering);
    audio.addEventListener("stalled", onBuffering);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("waiting", onBuffering);
      audio.removeEventListener("stalled", onBuffering);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [showToast, stopStream, update]);

  /* ---------------- volume / mute ---------------- */

  const setVolume = useCallback(
    (v: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = v / 100;
      store.set("volume", audio.volume); /* remember across visits */
      update((s) => ({
        ...s,
        volume: audio.volume,
        muted: audio.volume === 0,
        lastVol: audio.volume > 0 ? audio.volume : s.lastVol,
      }));
    },
    [update],
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const s = stateRef.current;
    const muted = !s.muted;
    const lastVol = muted ? audio.volume || s.lastVol : s.lastVol;
    audio.volume = muted ? 0 : s.lastVol || 0.9;
    store.set("muted", muted); /* remember across visits */
    store.set("volume", muted ? lastVol : audio.volume);
    update((st) => ({ ...st, muted, lastVol, volume: audio.volume }));
  }, [update]);

  /* ---------------- favorites / expanded / search / filter ---------------- */

  const toggleFav = useCallback(
    (id: number) => {
      update((s) => {
        const favorites = new Set(s.favorites);
        if (favorites.has(id)) favorites.delete(id);
        else favorites.add(id);
        return { ...s, favorites };
      });
    },
    [update],
  );

  const toggleExpanded = useCallback(
    (key: string) => {
      update((s) => {
        const expanded = new Set(s.expanded);
        if (expanded.has(key)) expanded.delete(key);
        else expanded.add(key);
        return { ...s, expanded };
      });
    },
    [update],
  );

  const setQuery = useCallback(
    (q: string) => update((s) => ({ ...s, query: q })),
    [update],
  );

  const setFilter = useCallback(
    (f: string) => update((s) => ({ ...s, filter: f })),
    [update],
  );

  const togglePbMin = useCallback(
    () => update((s) => ({ ...s, pbMin: !s.pbMin })),
    [update],
  );

  /* ---------------- history nav ---------------- */

  const lastNavRef = useRef(pathname);

  const navigate = useCallback(
    (path: Route, opts?: { replace?: boolean }) => {
      lastNavRef.current = path;
      if (opts?.replace) {
        update((s) => {
          const hist = s.hist.slice();
          hist[s.hIdx] = { path };
          return { ...s, hist };
        });
        router.replace(path);
      } else {
        update((s) => {
          const hist = s.hist.slice(0, s.hIdx + 1);
          hist.push({ path });
          return { ...s, hist, hIdx: hist.length - 1 };
        });
        router.push(path);
      }
    },
    [router, update],
  );

  const goHist = useCallback(
    (dir: number) => {
      const s = stateRef.current;
      const i = s.hIdx + dir;
      if (i < 0 || i >= s.hist.length) return;
      const target = s.hist[i].path as Route;
      lastNavRef.current = target;
      update((st) => ({ ...st, hIdx: i }));
      router.push(target);
    },
    [router, update],
  );

  /* If the URL changes without going through navigate()/goHist() (browser
     back/forward, <a> links, …), reset the in-app stack like a fresh load. */
  useEffect(() => {
    if (pathname === lastNavRef.current) return;
    lastNavRef.current = pathname;
    update((s) => ({ ...s, hist: [{ path: pathname }], hIdx: 0 }));
  }, [pathname, update]);

  /* ---------------- document title ---------------- */

  useEffect(() => {
    const s = STATIONS.find((x) => x.id === state.playing);
    document.title = s
      ? `▶ ${s.name} · NuxStream Radio`
      : "NuxStream Radio · All Stations";
  }, [state.playing]);

  /* ---------------- share ---------------- */

  const shareStation = useCallback(
    async (s: Station) => {
      const shareData = {
        title: s.name,
        text: `Listen live to ${s.name} (${s.city}) on NuxStream Radio 🇵🇭`,
        /* unlike the single-file original, each station now has a real URL */
        url: `${window.location.origin}/station/${s.id}`,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }
        await navigator.clipboard.writeText(
          `${shareData.text} — ${shareData.url}`,
        );
        showToast("Link copied to clipboard");
      } catch {
        /* user cancelled */
      }
    },
    [showToast],
  );

  /* ---------------- context value ---------------- */

  const value = useMemo<RadioContextValue>(
    () => ({
      ...state,
      canBack: state.hIdx > 0,
      canForward: state.hIdx < state.hist.length - 1,
      toast,
      navigate,
      goHist,
      playStation,
      togglePlay,
      stopStream,
      stepStation,
      toggleMute,
      setVolume,
      togglePbMin,
      toggleFav,
      toggleExpanded,
      setQuery,
      setFilter,
      showToast,
      shareStation,
    }),
    [
      state,
      toast,
      navigate,
      goHist,
      playStation,
      togglePlay,
      stopStream,
      stepStation,
      toggleMute,
      setVolume,
      togglePbMin,
      toggleFav,
      toggleExpanded,
      setQuery,
      setFilter,
      showToast,
      shareStation,
    ],
  );

  return (
    <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
  );
}
