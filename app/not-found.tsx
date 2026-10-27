import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-24 flex flex-col items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[.04] text-neutral-500">
        <span className="text-2xl">📻</span>
      </div>
      <p className="mt-4 text-lg font-bold text-neutral-300">
        Station not found
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        The station you’re looking for doesn’t exist.
      </p>
      <Link
        href="/stations"
        className="mt-6 rounded-full bg-nux-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-nux-400"
      >
        Browse all stations
      </Link>
    </div>
  );
}
