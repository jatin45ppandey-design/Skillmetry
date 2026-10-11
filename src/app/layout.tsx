import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { getServerAuthState } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Skillmetry — Your Career Digital Twin", template: "%s | Skillmetry" },
  description: "Explore adaptive roadmaps, measure demonstrated skills, and simulate career growth."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  const authState = await getServerAuthState();
  return <html lang="en"><body><AuthProvider initialState={authState}>{children}</AuthProvider></body></html>;
}
