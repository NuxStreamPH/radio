import type { IconName } from "@/components/Icons";

/* ---------------- data (PH) ---------------- */
/* NOTE: a station whose stream is http:// will be blocked by browsers when the
   app is served over https (mixed content). */
/* A station with an empty (or missing) `djs` array automatically renders the
   "Station Information" section on its page instead of DJ Bios. */

export interface DJ {
  name: string;
  show: string;
  bio: string;
  grad: string;
}

export interface Station {
  id: number;
  name: string;
  shorthand?: string;
  tagline: string;
  genre: string;
  city: string;
  region: string;
  icon?: string;
  stream: string;
  /** Tailwind gradient classes used for the artwork fallback + hero backdrop */
  bg: string;
  /** Short text rendered on the artwork when no icon is available */
  short: string;
  owner?: string | string[];
  description?: string;
  djs: DJ[];
}

export const STATIONS: Station[] = [
  {
    id: 1,
    name: "koolFM",
    shorthand: "kool Ka Dito!",
    tagline: "Ito ang Himpilan, Ito ang Tahanan!",
    genre: "Top-40 (CHR)",
    city: "Pasig City",
    region: "Manila",
    icon: "/stations/avatar_1.webp",
    stream:
      "https://publicprod-subsegment-radio.nuxservices.cfd/stream/koolfm?quality=medium&codec=opus",
    bg: "bg-gradient-to-br from-yellow-300 to-amber-300",
    short: "KOOL FM",
    owner: "SMILE Media Group",
    description: [
      `koolFM is an internet radio station streaming hailing from Pasig City, Metro Manila, Philippines, and available worldwide through TuneIn, Online Radio Box, and NuxStream Radio!`,
      `koolFM delivers non-stop music, news, information, and entertainment 24 hours a day, 7 days a week, giving listeners an easy way to enjoy their favorite songs, be informed at any time, and anywhere!`,
    ].join("\n"),
    djs: [],
  },
];

export const FILTERS = ["All Stations"] as const;

export interface NavItem {
  id: string;
  label: string;
  ic: IconName;
}

export const NAV_MAIN: NavItem[] = [
  { id: "home", label: "Home", ic: "home" },
  { id: "stations", label: "All Stations", ic: "radio" },
  { id: "podcasts", label: "Podcasts", ic: "podcast" },
];

export const TABS: NavItem[] = [
  { id: "home", label: "Home", ic: "home" },
  { id: "stations", label: "Stations", ic: "radio" },
  { id: "podcasts", label: "Podcasts", ic: "podcast" },
];
