"use client";

import { useRef } from "react";
import { Icon } from "@/components/Icons";
import StationCard from "./StationCard";
import { useRadio } from "@/components/providers/RadioProvider";
import type { Station } from "@/lib/stations";

/* Ported sectionHTML(): a titled row of station cards with optional
   horizontal scrolling arrows + Show more/less expansion. */

export default function StationSection({
  title,
  list,
  wrap = false,
}: {
  title: string;
  list: Station[];
  wrap?: boolean;
}) {
  const { expanded, toggleExpanded } = useRadio();
  const isExpanded = expanded.has(title);
  const rowRef = useRef<HTMLDivElement>(null);

  const rowCls =
    wrap || isExpanded
      ? "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
      : "flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:gap-4 sm:overflow-x-auto sm:no-scrollbar sm:px-1 sm:pb-1";

  const scrollBy = (dir: number) =>
    rowRef.current?.scrollBy({ left: 360 * dir, behavior: "smooth" });

  return (
    <section className="mb-9">
      <div className="mb-3 flex items-center gap-1">
        <h2 className="flex-1 truncate text-lg font-bold text-neutral-200">
          {title}
        </h2>
        {!wrap && (
          <>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="hidden rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white sm:block"
            >
              <Icon name="chevL" className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="hidden rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white sm:block"
            >
              <Icon name="chevR" className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleExpanded(title)}
              className="px-2 py-1 text-sm font-semibold text-nux-500 transition hover:text-nux-400"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          </>
        )}
      </div>
      <div ref={rowRef} className={`row ${rowCls} scroll-smooth`}>
        {list.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>
    </section>
  );
}
