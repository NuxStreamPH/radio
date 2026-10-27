import { Icon, type IconName } from "@/components/Icons";

/* Ported emptyState() */

export default function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: IconName;
  title: string;
  sub: string;
}) {
  return (
    <div className="mt-24 flex flex-col items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[.04] text-neutral-500">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <p className="mt-4 text-lg font-bold text-neutral-300">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{sub}</p>
    </div>
  );
}
