import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Skillmetry — Your Career Digital Twin", template: "%s | Skillmetry" },
  description: "Explore adaptive roadmaps, measure demonstrated skills, and simulate career growth."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
