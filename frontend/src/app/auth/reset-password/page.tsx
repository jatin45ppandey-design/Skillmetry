import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return <main className="auth-shell">
    <nav className="auth-nav"><Brand /><Link className="btn btn-quiet" href="/dashboard">Preview demo (no quizzes)</Link></nav>
    <section className="auth-card">
      <PasswordRecoveryForm mode="update" configured={isSupabaseConfigured()} nextPath="/account" />
    </section>
  </main>;
}
