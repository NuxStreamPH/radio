"use client";

import { useSyncExternalStore } from "react";

/* subscribe is a no-op: the snapshot only ever changes once (at hydration),
   which React handles by re-checking getSnapshot after the initial render. */
const subscribe = () => () => {};

/**
 * Returns `false` during SSR and the hydration pass, then `true`.
 *
 * This is the canonical useSyncExternalStore replacement for the classic
 * `useEffect(() => setMounted(true), [])` pattern — it avoids a cascading
 * setState-in-effect (flagged by react-hooks/set-state-in-effect) while
 * still guaranteeing the server and client renders match.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
