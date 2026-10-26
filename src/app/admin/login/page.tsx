import Link from "next/link";
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="login-page">
      <Link className="wordmark" href="/" aria-label="SpaceEnvy home">
        <span className="wordmark__icon" aria-hidden="true">
          S
        </span>
        <span>spaceenvy</span>
      </Link>
      <section className="login-card">
        <p className="eyebrow">Private workspace</p>
        <h1>Welcome back.</h1>
        <p className="login-card__intro">
          Sign in with the email address approved for SpaceEnvy admin access.
        </p>
        {configured ? (
          <LoginForm />
        ) : (
          <div className="setup-notice" role="status">
            <strong>Supabase setup needed</strong>
            <span>
              Add your Supabase URL and publishable/anon key to the environment
              before signing in.
            </span>
          </div>
        )}
        <Link className="login-card__back" href="/">
          <span aria-hidden="true">←</span> Back to SpaceEnvy
        </Link>
      </section>
      <p className="login-page__caption">SpaceEnvy · Hyderabad</p>
    </main>
  );
}
