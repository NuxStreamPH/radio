"use client";

import { usePathname } from "next/navigation";
import { useRadio } from "@/components/providers/RadioProvider";
import { FILTERS } from "@/lib/stations";
import { viewForPath } from "@/lib/nav";

export default function FilterPills() {
  const { filter, setFilter } = useRadio();
  /* hidden on the station detail view (ported renderPills()) */
  const show = viewForPath(usePathname()) !== "station";

  return (
    <header className={`px-4 pt-3 sm:px-6 sm:pt-4 ${show ? "" : "hidden"}`}>
      <div
        id="pills"
        className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-white/[.04] p-2 backdrop-blur"
      >
        {FILTERS.map((f) => {
          const a = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                a
                  ? "border-nux-600 bg-nux-500 text-black shadow-blue-500/50"
                  : "border-white/10 text-neutral-300 hover:border-white/40 hover:text-white"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
    </header>
  );
}
