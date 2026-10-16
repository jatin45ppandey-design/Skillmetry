import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import "./studio.css";
import "./studio-surfaces.css";
import "./learning-workflows.css";
import "./passport-workflows.css";
import { AuthProvider } from "@/components/auth-provider";
import { getServerAuthState } from "@skillmetry/backend/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Skillmetry — Your Career Digital Twin", template: "%s | Skillmetry" },
  description: "Take secure skill assessments, explore an adaptive roadmap, and build a quiz-driven Career Digital Twin."
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
  return <html lang="en"><body className={`${displayFont.variable} ${uiFont.variable} ${technicalFont.variable}`}><AuthProvider initialState={authState}>{children}</AuthProvider></body></html>;
}
