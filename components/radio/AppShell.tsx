"use client";

/* Ported <body> markup of the original file: sidebar + main column +
   mobile bottom tabs + floating player bar + toast. Route content is
   injected through {children} inside the scrollable #content area. */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useRadio } from "@/components/providers/RadioProvider";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import FilterPills from "./FilterPills";
import BottomTabs from "./BottomTabs";
import PlayerBar from "./PlayerBar";
import Toast from "./Toast";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stopStream, togglePlay, playing, setQuery } = useRadio();
  const [searchOpen, setSearchOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  /* the in-app scroll container — reset to top on every route change
     (the original did this inside applyNav()) */
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, [setQuery]);

  /* app-wide keybindings (ported): Escape closes search / stops the stream,
     Space toggles playback */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchOpen) {
          closeSearch();
          return;
        }
        stopStream();
        return;
      }
      const tag = document.activeElement?.tagName ?? "";
      if (
        e.code === "Space" &&
        playing != null &&
        !/INPUT|TEXTAREA|BUTTON/.test(tag)
      ) {
        e.preventDefault();
        togglePlay(playing);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch, stopStream, playing, togglePlay]);

  return (
    <>
      <div className="flex h-full">
        {/* ============ SIDEBAR (desktop) ============ */}
        <Sidebar />

        {/* ============ MAIN ============ */}
        <main className="flex h-full min-w-0 flex-1 flex-col lg:my-3 lg:mr-3 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-white/10 lg:bg-neutral-900/40">
          <MobileHeader searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
          <FilterPills />
          <div
            ref={contentRef}
            id="content"
            className="flex-1 overflow-y-auto px-4 pt-5 pb-44 sm:px-6 lg:pb-28 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.15)_transparent]"
          >
            {children}
          </div>
        </main>
      </div>

      {/* ============ BOTTOM TABS (mobile) ============ */}
      <BottomTabs />

      {/* ============ FULL-WIDTH PLAYER BAR ============ */}
      <PlayerBar />

      {/* Toast */}
      <Toast />
    </>
  );
}
