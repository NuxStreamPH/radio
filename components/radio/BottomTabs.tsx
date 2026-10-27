"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icons";
import { useRadio } from "@/components/providers/RadioProvider";
import { TABS } from "@/lib/stations";
import { pathForView, tabFor, viewForPath } from "@/lib/nav";

export default function BottomTabs() {
  const { navigate, favorites } = useRadio();
  const active = tabFor(viewForPath(usePathname()));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-neutral-950/95 backdrop-blur lg:hidden">
      <div
        id="tabBar"
        className="mx-auto grid max-w-lg grid-cols-3 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {TABS.map((t) => {
          const a = t.id === active;
          const badge = t.id === "favorites" && favorites.size > 0;
          return (
            <button
              key={t.id}
              onClick={() => navigate(pathForView(t.id))}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition ${
                a ? "text-nux-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <span className="relative">
                <Icon name={t.ic} className="h-[22px] w-[22px]" />
                {badge && (
                  <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-nux-500 px-1 text-[10px] font-bold text-black">
                    {favorites.size}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
