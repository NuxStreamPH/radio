/* Minimal class-name joiner (no tailwind-merge: the port intentionally keeps
   the exact class sets the original app produced, including intentional
   overrides like `rounded-lg … rounded-2xl`). */
export function cn(
  ...parts: (string | false | null | undefined)[]
): string {
  return parts.filter(Boolean).join(" ");
}
