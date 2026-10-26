import type { Metadata } from "next";
import { HomepageEditor } from "@/components/admin/homepage-editor";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const settings = await getSiteSettings();

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <p className="eyebrow">Your studio, online</p>
        <h1>Homepage overview</h1>
        <p>Shape the first impression clients get when they visit SpaceEnvy.</p>
      </div>
      <HomepageEditor settings={settings} />
    </div>
  );
}
