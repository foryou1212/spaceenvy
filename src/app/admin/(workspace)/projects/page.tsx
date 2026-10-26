import type { Metadata } from "next";
import { ProjectManager } from "@/components/admin/project-manager";
import { requireAdmin } from "@/lib/admin-auth";
import type { Project } from "@/lib/types";

export const metadata: Metadata = {
  title: "Manage projects",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load projects for the admin workspace.", error);
    throw new Error("Project information could not be loaded.");
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <p className="eyebrow">Portfolio management</p>
        <h1>Projects</h1>
        <p>Add project stories and choose whether they appear on the public site.</p>
      </div>
      <ProjectManager projects={(data ?? []) as Project[]} />
    </div>
  );
}
