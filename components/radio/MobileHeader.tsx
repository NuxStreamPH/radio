"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icons";
import { useRadio } from "@/components/providers/RadioProvider";
import { viewForPath } from "@/lib/nav";

export default function MobileHeader({
  searchOpen,
  setSearchOpen,
}: {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}) {
  const { navigate, query, setQuery } = useRadio();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const toggleSearch = () => {
    const open = !searchOpen;
    setSearchOpen(open);
    /* closing the search also clears the query (ported openSearch(false)) */
    if (!open) setQuery("");
  };

  const onInput = (value: string) => {
    setQuery(value);
    /* typing a query jumps to the stations view without pushing history,
       just like the original (`state.view = "stations"`) */
    if (value && viewForPath(pathname) !== "stations") {
      navigate("/stations", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => navigate("/home")}
          className="select-none text-left leading-[0.8]"
        >
          <span className="block text-[22px] font-bold tracking-tight text-nux-500 [text-shadow:0_2px_0_rgba(0,0,0,.55)]">
            NuxStream
          </span>
          <span className="block text-[22px] font-bold tracking-tight text-nux-500 [text-shadow:0_2px_0_rgba(0,0,0,.55)]">
            Radio<span className="align-top text-xs">🇵🇭</span>
          </span>
        </button>
        <button
          onClick={toggleSearch}
          aria-label="Search"
          className="rounded-xl p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white"
        >
          <Icon name="search" />
        </button>
      </div>
      <div className={`${searchOpen ? "" : "hidden"} px-4 pb-3`}>
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
          <span className="text-neutral-500">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onInput(e.target.value)}
            placeholder="Hanapin ang istasyon…"
            className="w-full bg-transparent text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear"
            className={`${
              query ? "" : "hidden"
            } rounded-full p-1 text-neutral-400 hover:bg-white/10 hover:text-white`}
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
