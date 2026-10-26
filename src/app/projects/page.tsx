import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  alternates: { canonical: "/projects" },
  description:
    "Explore upcoming and completed home, apartment, and commercial interior design projects by SpaceEnvy in Hyderabad.",
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="loading-public" aria-label="Loading projects" />}>
        <ProjectsContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function ProjectsContent() {
  const projects = await getProjects();
  const upcoming = projects.filter((project) => project.status === "upcoming");
  const completed = projects.filter((project) => project.status === "completed");

  return (
      <main>
        <section className="page-hero page-shell">
          <p className="eyebrow">Ideas taking shape</p>
          <h1>Projects, at every stage.</h1>
          <p>
            A look at the spaces we’re working on and the ones ready to welcome
            their next chapter.
          </p>
          <div className="project-jump-links">
            <Link href="#upcoming">Upcoming projects</Link>
            <Link href="#completed">Completed projects</Link>
          </div>
        </section>
        <section className="project-list-section page-shell" id="upcoming">
          <div className="section-heading">
            <div>
              <p className="eyebrow">On the drawing board</p>
              <h2>Upcoming projects</h2>
            </div>
            <span className="project-count">{upcoming.length} projects</span>
          </div>
          {upcoming.length ? (
            <div className="project-grid">
              {upcoming.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No upcoming projects are published right now. Check back soon, or{" "}
              <Link href="/#enquire">tell us about your space</Link>.
            </p>
          )}
        </section>
        <section className="project-list-section project-list-section--alt" id="completed">
          <div className="page-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Ready to be lived in</p>
                <h2>Completed projects</h2>
              </div>
              <span className="project-count">{completed.length} projects</span>
            </div>
            {completed.length ? (
              <div className="project-grid">
                {completed.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <p className="empty-state">
                Completed project stories will appear here as they are added.{" "}
                <Link href="/#enquire">Start a project with us</Link>.
              </p>
            )}
          </div>
        </section>
      </main>
  );
}
