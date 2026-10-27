import type { Metadata, Viewport } from "next";
import { Stack_Sans_Headline } from "next/font/google";
import "./globals.css";
import RadioProvider from "@/components/providers/RadioProvider";
import AppShell from "@/components/radio/AppShell";

/* Self-hosted via next/font (replaces the original <link> to Google Fonts).
   Exposed as --font-stack-sans, which globals.css wires into the Tailwind
   --font-sans / --font-display theme variables. */
const displayFont = Stack_Sans_Headline({
  variable: "--font-system",
  subsets: ["latin"],
  display: "swap",
  /* no fallback-metrics override exists for this font yet — silences the
     "Failed to find font override values" build warning */
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "NuxStream Radio",
  description: "A Concord Communications service.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={displayFont.variable}>
      <body className="h-dvh overflow-hidden bg-neutral-950 font-sans text-neutral-100 antialiased selection:bg-nux-400/30">
        <RadioProvider>
          <AppShell>{children}</AppShell>
        </RadioProvider>
      </body>
    </html>
  );
}
