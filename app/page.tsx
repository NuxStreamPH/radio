import { redirect } from "next/navigation";

/* The original single-file app boots into the "All Stations" view
   (state.view = "stations"), so "/" redirects there. */
export default function RootPage() {
  redirect("/home");
}
