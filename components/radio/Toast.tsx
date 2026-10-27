"use client";

import { useRadio } from "@/components/providers/RadioProvider";
import { cn } from "@/lib/utils";

export default function Toast() {
  const { toast } = useRadio();
  return (
    <div
      id="toast"
      className={cn(
        "pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur transition-all duration-300",
        toast.isErr
          ? "border-red-400/30 bg-red-950/90 text-red-200"
          : "border-white/10 bg-neutral-800/95 text-neutral-100",
        toast.visible ? "opacity-100" : "opacity-0",
      )}
    >
      {toast.msg}
    </div>
  );
}
