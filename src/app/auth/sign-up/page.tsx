import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { safeInternalPath } from "@/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }:{ searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  const nextPath = safeInternalPath(query.next);
  return <main className="auth-shell"><nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/dashboard">Use demo workspace</Link></nav><section className="auth-card"><AuthForm mode="sign-up" configured={isSupabaseConfigured()} nextPath={nextPath}/></section></main>;
}
