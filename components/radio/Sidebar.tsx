"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icons";
import { useRadio } from "@/components/providers/RadioProvider";
import { NAV_MAIN } from "@/lib/stations";
import { pathForView, viewForPath } from "@/lib/nav";
import Logo from "./Logo";

export default function Sidebar() {
  const { navigate, favorites } = useRadio();
  const view = viewForPath(usePathname());

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/5 bg-neutral-950 lg:flex">
      <div className="flex h-full w-64 flex-col">
        <div className="px-5 pt-6 pb-5">
          <button
            onClick={() => navigate("/home")}
            className="select-none text-left leading-[0.85]"
          >
            <div className="flex space-x-1 select-none [-webkit-user-drag:none] [user-drag:none]">
              <Logo></Logo>
              <div className="block">
                <span className="block text-[27px] font-bold tracking-tight text-nux-500 [text-shadow:0_2px_0_rgba(0,0,0,.55)]">
                  NuxStream
                </span>
                <span className="block text-[27px] font-bold tracking-tight text-nux-500 [text-shadow:0_2px_0_rgba(0,0,0,.55)]">
                  Radio
                </span>
              </div>
            </div>
          </button>
        </div>

        <nav id="navMain" className="space-y-1 px-3">
          {NAV_MAIN.map(({ id, label, ic }) => {
            const active = view === id;
            const badge = id === "favorites" && favorites.size > 0;
            return (
              <button
                key={id}
                onClick={() => navigate(pathForView(id))}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white/8 border-white/15 text-white shadow-nux-500/50"
                    : "border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon name={ic} />
                <span>{label}</span>
                {badge && (
                  <span className="ml-auto rounded-full bg-nux-400/15 px-2 py-0.5 text-xs font-bold text-nux-400">
                    {favorites.size}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 px-6 pb-6 select-none pointer-events-none">
          <div
            id="verSign"
            className="items-center text-left gap-2 w-full text-sm font-semibold text-neutral-200"
          >
            <span>Open Beta</span>
            <br />
            <span>Services: </span>
            <span className="font-thin">v0.0.1</span>
            <br />
            <span>WebApp: </span>
            <span className="font-thin">v0.0.1</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
