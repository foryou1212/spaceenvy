"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { allowedProjectImageTypes, maxProjectImageSize } from "@/lib/media";
import type { Project } from "@/lib/types";
import { deleteProject, saveProject } from "@/app/admin/(workspace)/actions";

type Message = { text: string; success: boolean };

function ProjectForm({
  project,
  onSaved,
}: {
  project?: Project;
  onSaved: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? "");
  const [imagePath, setImagePath] = useState(project?.image_path ?? "");
  const [imageMessage, setImageMessage] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, startSaving] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function uploadImage(file?: File) {
    if (!file) return;
    setImageMessage("");
    if (!allowedProjectImageTypes.includes(file.type)) {
      setImageMessage("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > maxProjectImageSize) {
      setImageMessage("Images must be 10 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const safeName = file.name.replace(/[^\w.-]/g, "-");
      const path = `${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage
        .from("project-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (error) {
        setImageMessage("Image upload failed. Please try again or check storage access.");
        return;
      }

      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setImagePath(path);
      setImageMessage("Image uploaded.");
    } catch {
      setImageMessage("Image upload could not connect. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;
    setMessage(null);
    const formData = new FormData(formRef.current);
    startSaving(async () => {
      try {
        const result = await saveProject(formData);
        setMessage({ text: result.message, success: result.success });
        if (result.success) onSaved();
      } catch {
        setMessage({
          text: "Project could not be saved. Please try again.",
          success: false,
        });
      }
    });
  }

  return (
    <form
      className="admin-form project-form"
      ref={formRef}
      onSubmit={submitProject}
    >
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imagePath" value={imagePath} />
      <label>
        Project name
        <input
          name="title"
          defaultValue={project?.title ?? ""}
          placeholder="e.g. A calmer city home"
          minLength={2}
          maxLength={120}
          required
        />
      </label>
      <label>
        Project URL name (optional)
        <input
          name="slug"
          defaultValue={project?.slug ?? ""}
          placeholder="e.g. calmer-city-home"
          maxLength={140}
        />
      </label>
      <div className="form-row">
        <label>
          Space type
          <input
            name="category"
            defaultValue={project?.category ?? ""}
            placeholder="Home, apartment, office…"
            maxLength={100}
            required
          />
        </label>
        <label>
          Location
          <input
            name="location"
            defaultValue={project?.location ?? "Hyderabad"}
            maxLength={160}
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Project stage
          <select name="status" defaultValue={project?.status ?? "upcoming"}>
            <option value="upcoming">Upcoming / in progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label className="admin-checkbox">
          <input
            name="isPublished"
            type="checkbox"
            defaultChecked={project?.is_published ?? false}
          />
          <span>Show this project on the public website</span>
        </label>
      </div>
      <label>
        Project story
        <textarea
          name="description"
          defaultValue={project?.description ?? ""}
          rows={3}
          maxLength={1200}
          placeholder="A short description of the brief, approach, or finished space."
        />
      </label>
      <div className="image-upload">
        <label>
          Project image <span aria-hidden="true">*</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => uploadImage(event.currentTarget.files?.[0])}
          />
        </label>
        <p>JPG, PNG, WebP, or AVIF · Up to 10 MB</p>
        {imageUrl ? (
          <div className="image-upload__preview">
            <Image src={imageUrl} alt="Selected project preview" fill sizes="220px" />
          </div>
        ) : null}
        {imageMessage ? (
          <p className="form-message form-message--muted" role="status">
            {imageMessage}
          </p>
        ) : null}
      </div>
      <div className="admin-form__footer">
        <p>Unpublished projects remain visible to approved admins only.</p>
        <button
          className="button"
          type="submit"
          disabled={saving || uploading || !imageUrl || !imagePath}
        >
          {uploading ? "Uploading image…" : saving ? "Saving…" : "Save project"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      {message ? (
        <p
          className={`form-message form-message--${message.success ? "success" : "error"}`}
          role={message.success ? "status" : "alert"}
        >
          {message.text}
        </p>
      ) : null}
    </form>
  );
}

export function ProjectManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [deleting, startDeleting] = useTransition();

  function refresh() {
    router.refresh();
  }

  function removeProject(project: Project) {
    if (!window.confirm(`Delete “${project.title}” and its project image?`)) return;
    setMessage("");
    startDeleting(async () => {
      try {
        const result = await deleteProject(project.id);
        setMessage(result.message);
        if (result.success) router.refresh();
      } catch {
        setMessage("Project could not be deleted. Please try again.");
      }
    });
  }

  return (
    <div className="admin-projects">
      <section className="admin-panel">
        <div className="admin-panel__heading">
          <div>
            <p className="eyebrow">Add to your portfolio</p>
            <h2>New project</h2>
          </div>
        </div>
        <ProjectForm onSaved={refresh} />
      </section>
      <section className="admin-panel">
        <div className="admin-panel__heading">
          <div>
            <p className="eyebrow">Your portfolio</p>
            <h2>Existing projects</h2>
          </div>
          <span className="admin-edit-badge">{projects.length} total</span>
        </div>
        {projects.length ? (
          <div className="admin-project-list">
            {projects.map((project) => (
              <details className="admin-project" key={project.id}>
                <summary>
                  <span className="admin-project__summary">
                    {project.image_url ? (
                      <span className="admin-project__thumbnail">
                        <Image
                          src={project.image_url}
                          alt=""
                          fill
                          sizes="64px"
                        />
                      </span>
                    ) : null}
                    <span>
                      <strong>{project.title}</strong>
                      <small>
                        {project.category} · {project.status} ·{" "}
                        {project.is_published ? "Published" : "Draft"}
                      </small>
                    </span>
                  </span>
                  <span className="admin-project__toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <ProjectForm project={project} onSaved={refresh} />
                <div className="admin-project__delete">
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => removeProject(project)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete project"}
                  </button>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="admin-empty">
            No projects yet. Add a project above to start building your portfolio.
          </p>
        )}
        {message ? <p className="form-message form-message--error">{message}</p> : null}
      </section>
    </div>
  );
}
