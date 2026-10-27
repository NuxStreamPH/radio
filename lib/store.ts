/* ---------------- persistent store ---------------- */
/* Thin localStorage wrapper (same keys/prefix as the original single-file app).
   Only ever called from client-side code (effects / event handlers). */

export const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem("nxsr:" + k);
      return v === null ? d : (JSON.parse(v) as T);
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown): void {
    try {
      localStorage.setItem("nxsr:" + k, JSON.stringify(v));
    } catch {
      /* storage unavailable (private mode, quota, …) */
    }
  },
};
