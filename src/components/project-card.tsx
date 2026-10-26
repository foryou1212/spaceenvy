import Image from "next/image";
import type { Project } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className="project-card__image">
        <Image
          src={project.image_url || fallbackImage}
          alt={`${project.title} interior`}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="project-card__photo"
        />
        <span className="project-card__status">
          {project.status === "upcoming" ? "In progress" : "Completed"}
        </span>
      </div>
      <div className="project-card__details">
        <div>
          <h3>{project.title}</h3>
          <p>{project.category}</p>
        </div>
        <span className="project-card__location">{project.location}</span>
      </div>
      {project.description ? (
        <p className="project-card__description">{project.description}</p>
      ) : null}
    </article>
  );
}
