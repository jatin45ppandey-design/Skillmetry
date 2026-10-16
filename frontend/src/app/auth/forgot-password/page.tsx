import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({ searchParams }: {
  searchParams: Promise<{ next?: string }>;
}) {
  const query = await searchParams;
  return <main className="auth-shell">
    <nav className="auth-nav"><Brand /><Link className="btn btn-quiet" href="/dashboard">Preview demo (no quizzes)</Link></nav>
    <section className="auth-card">
      <PasswordRecoveryForm mode="request" configured={isSupabaseConfigured()} nextPath={safeInternalPath(query.next)} />
    </section>
  </main>;
}
