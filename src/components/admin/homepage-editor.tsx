"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  saveHomepageContent,
  type ActionResult,
} from "@/app/admin/(workspace)/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { allowedProjectImageTypes, maxProjectImageSize } from "@/lib/media";
import type { SiteSettings } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

export function HomepageEditor({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveHomepageContent, initialState);
  const [imageUrl, setImageUrl] = useState(settings.hero_image_url);
  const [imagePath, setImagePath] = useState(settings.hero_image_path ?? "");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadHeroImage(file?: File) {
    if (!file) return;
    setUploadMessage("");
    if (!allowedProjectImageTypes.includes(file.type)) {
      setUploadMessage("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > maxProjectImageSize) {
      setUploadMessage("Images must be 10 MB or smaller.");
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
        setUploadMessage("Image upload failed. Check storage access and try again.");
        return;
      }

      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setImagePath(path);
      setUploadMessage("Homepage image uploaded. Save the page to publish it.");
    } catch {
      setUploadMessage("Image upload could not connect. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading">
        <div>
          <p className="eyebrow">Editable content</p>
          <h2>Homepage & studio introduction</h2>
        </div>
        <span className="admin-edit-badge">Live content</span>
      </div>
      <form className="admin-form" action={action}>
        <label>
          Hero eyebrow
          <input
            name="heroEyebrow"
            defaultValue={settings.hero_eyebrow}
            maxLength={100}
            required
          />
        </label>
        <label>
          Main headline
          <input
            name="heroTitle"
            defaultValue={settings.hero_title}
            minLength={3}
            maxLength={120}
            required
          />
        </label>
        <label>
          Homepage introduction
          <textarea
            name="heroDescription"
            defaultValue={settings.hero_description}
            rows={3}
            minLength={10}
            maxLength={600}
            required
          />
        </label>
        <div className="image-upload">
          <label>
            Homepage hero image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => uploadHeroImage(event.currentTarget.files?.[0])}
            />
          </label>
          <input type="hidden" name="heroImageUrl" value={imageUrl} />
          <input type="hidden" name="heroImagePath" value={imagePath} />
          <p>JPG, PNG, WebP, or AVIF · Up to 10 MB</p>
          <div className="image-upload__preview image-upload__preview--wide">
            <Image
              src={imageUrl}
              alt="Current homepage hero preview"
              fill
              sizes="(max-width: 700px) 100vw, 520px"
            />
          </div>
          {uploadMessage ? (
            <p
              className={`form-message form-message--${uploadMessage.includes("uploaded") ? "success" : "error"}`}
              role="status"
            >
              {uploadMessage}
            </p>
          ) : null}
        </div>
        <div className="admin-form__divider">
          <span>About section</span>
        </div>
        <label>
          About heading
          <input
            name="aboutHeading"
            defaultValue={settings.about_heading}
            minLength={3}
            maxLength={160}
            required
          />
        </label>
        <label>
          About introduction
          <textarea
            name="aboutText"
            defaultValue={settings.about_text}
            rows={5}
            minLength={10}
            maxLength={1200}
            required
          />
        </label>
        <div className="admin-form__footer">
          <p>Changes appear on the public website as soon as you save.</p>
          <button className="button" type="submit" disabled={pending || uploading}>
            {uploading ? "Uploading image…" : pending ? "Saving…" : "Save homepage"}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        {state.message ? (
          <p
            className={`form-message form-message--${state.success ? "success" : "error"}`}
            role={state.success ? "status" : "alert"}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
