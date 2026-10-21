import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import "./studio.css";
import "./studio-surfaces.css";
import "./learning-workflows.css";
import "./passport-workflows.css";
import "./experience-v2.css";
import "./experience-v3.css";
import "./motion-system.css";
import "./admin-studio.css";
import "./phase0-layout.css";
import "./phase1-4-ux.css";
import "./phase5-7-ux.css";
import "./product-phases-1-5.css";
import "./milestone-b.css";
import "./landing-atlas-v4.css";
import { NavigationProgress } from "@/components/navigation-progress";
import { AuthProvider } from "@/components/auth-provider";
import { getServerAuthState } from "@skillmetry/backend/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Skillmetry — Find Your Next Learning Step", template: "%s | Skillmetry" },
  description: "Choose a career direction, take honest foundational assessments, and find clear learning steps through a personalized roadmap."
};

export const viewport: Viewport = {
  themeColor: "#FBF5EA"
};

export const dynamic = "force-dynamic";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});
const uiFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap"
});
const technicalFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-technical",
  display: "swap"
});

export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  const authState = await getServerAuthState();
  return <html lang="en"><body className={`${displayFont.variable} ${uiFont.variable} ${technicalFont.variable}`}><NavigationProgress/><AuthProvider initialState={authState}>{children}</AuthProvider></body></html>;
}
