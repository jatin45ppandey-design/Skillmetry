import type { Metadata } from "next";
import { PublicPassportView } from "@/components/public-passport-view";
export const metadata: Metadata = {
  title: "Shared learning snapshot",
  robots: { index: false, follow: false }
};
export default async function SharedPassportPage({params}:{params:Promise<{token:string}>}) {
  const {token}=await params;
  return <main className="auth-shell"><section className="auth-card">
    <PublicPassportView token={token}/>
  </section></main>;
}
