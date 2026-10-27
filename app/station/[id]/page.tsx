import { notFound } from "next/navigation";
import StationView from "@/components/views/StationView";
import { STATIONS } from "@/lib/stations";

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const station = STATIONS.find((s) => String(s.id) === id);
  if (!station) notFound();
  return <StationView station={station} />;
}
