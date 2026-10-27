"use client";

import { useState } from "react";
import type { Station } from "@/lib/stations";

/* Ported artClasses() + artInner(): gradient tile with the station icon on
   top; falls back to the `short` label when no icon exists or it fails to
   load. */

export default function StationArt({
  station: s,
  size = "h-14 w-14",
  className = "",
}: {
  station: Station;
  size?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`${size} relative shrink-0 overflow-hidden rounded-lg grid place-items-center text-center font-bold italic leading-tight ${s.bg} text-white ${className}`}
    >
      {s.icon && !failed && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={s.icon}
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover relative"
          onError={() => setFailed(true)}
        />
      )}
      {s.icon ? (
        <span
          className={`${
            failed ? "" : "sr-only"
          } absolute inset-0 grid place-items-center px-1 text-[9px]`}
        >
          {s.short}
        </span>
      ) : (
        <span className="px-1 text-[9px]">{s.short}</span>
      )}
    </div>
  );
}
