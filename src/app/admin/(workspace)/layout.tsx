import type { ReactNode } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/app/admin/auth-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

function AdminLoading() {
  return <div className="admin-loading">Loading your workspace…</div>;
}

async function ProtectedWorkspace({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="admin-setup">
        <h1>Connect Supabase to continue.</h1>
        <p>
          Add the project URL and publishable/anon key to the environment, then
          reload this page.
        </p>
        <Link className="text-link" href="/">
          Back to SpaceEnvy <span aria-hidden="true">↗</span>
        </Link>
      </div>
    );
  }

  const { user } = await requireAdmin();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <Link className="wordmark" href="/">
            <span className="wordmark__icon" aria-hidden="true">
              S
            </span>
            <span>spaceenvy</span>
          </Link>
          <span className="admin-topbar__label">Studio admin</span>
        </div>
        <div className="admin-topbar__user">
          <span>{user.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="admin-signout">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <p className="admin-sidebar__label">Workspace</p>
          <nav aria-label="Admin navigation">
            <Link href="/admin">Overview & homepage</Link>
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/enquiries">Enquiries</Link>
            <Link href="/admin/testimonials">Testimonials</Link>
          </nav>
          <div className="admin-sidebar__note">
            <span className="enquiry-note__dot" />
            <span>Only approved accounts can access this workspace.</span>
          </div>
        </aside>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default function AdminWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ProtectedWorkspace>{children}</ProtectedWorkspace>
    </Suspense>
  );
}
