"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import type { Project } from "@/lib/types";

export type ActionResult = {
  success: boolean;
  message: string;
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveHomepageContent(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const heroEyebrow = readText(formData, "heroEyebrow");
  const heroTitle = readText(formData, "heroTitle");
  const heroDescription = readText(formData, "heroDescription");
  const heroImageUrl = readText(formData, "heroImageUrl");
  const heroImagePath = readText(formData, "heroImagePath");
  const aboutHeading = readText(formData, "aboutHeading");
  const aboutText = readText(formData, "aboutText");
  let imageUrl: URL;
  try {
    imageUrl = new URL(heroImageUrl);
  } catch {
    return {
      success: false,
      message: "Upload a valid homepage image before saving.",
    };
  }

  if (
    heroEyebrow.length > 100 ||
    heroTitle.length < 3 ||
    heroTitle.length > 120 ||
    heroDescription.length < 10 ||
    heroDescription.length > 600 ||
    imageUrl.protocol !== "https:" ||
    heroImagePath.length > 512 ||
    aboutHeading.length < 3 ||
    aboutHeading.length > 160 ||
    aboutText.length < 10 ||
    aboutText.length > 1200
  ) {
    return {
      success: false,
      message: "Check the content lengths and complete each required field.",
    };
  }

  const { supabase } = await requireAdmin();
  const { data: previousSettings, error: readError } = await supabase
    .from("site_settings")
    .select("hero_image_path")
    .eq("id", "home")
    .maybeSingle();

  if (readError) {
    console.error("Unable to read the current homepage image.", readError);
    throw new Error("Homepage content could not be loaded before saving.");
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      hero_eyebrow: heroEyebrow,
      hero_title: heroTitle,
      hero_description: heroDescription,
      hero_image_url: heroImageUrl,
      hero_image_path: heroImagePath || null,
      about_heading: aboutHeading,
      about_text: aboutText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "home");

  if (error) {
    console.error("Unable to save SpaceEnvy homepage content.", error);
    throw new Error("Homepage content could not be saved. Please try again.");
  }

  if (
    previousSettings?.hero_image_path &&
    previousSettings.hero_image_path !== heroImagePath
  ) {
    const { error: storageError } = await supabase.storage
      .from("project-images")
      .remove([previousSettings.hero_image_path]);

    if (storageError) {
      console.error("Homepage saved, but its previous image could not be removed.", storageError);
      revalidatePath("/");
      revalidatePath("/about");
      return {
        success: false,
        message: "Homepage saved, but the previous image could not be removed from storage.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/about");
  return { success: true, message: "Homepage content saved." };
}

export async function saveProject(formData: FormData): Promise<ActionResult> {
  const id = readText(formData, "id");
  const title = readText(formData, "title");
  const slugInput = readText(formData, "slug") || title;
  const slug = slugInput
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const category = readText(formData, "category");
  const location = readText(formData, "location");
  const status = readText(formData, "status");
  const description = readText(formData, "description");
  const imageUrl = readText(formData, "imageUrl");
  const imagePath = readText(formData, "imagePath");
  const isPublished = formData.get("isPublished") === "on";

  if (
    title.length < 2 ||
    title.length > 120 ||
    !slug ||
    slug.length > 140 ||
    category.length < 2 ||
    category.length > 100 ||
    location.length < 2 ||
    location.length > 160 ||
    (status !== "upcoming" && status !== "completed") ||
    description.length > 1200 ||
    !imageUrl ||
    !imagePath
  ) {
    return {
      success: false,
      message: "Complete the required fields and upload a project image.",
    };
  }

  const { supabase } = await requireAdmin();
  const project: Omit<Project, "created_at"> = {
    id: id || crypto.randomUUID(),
    title,
    slug,
    category,
    location,
    status,
    description,
    image_url: imageUrl,
    image_path: imagePath,
    is_published: isPublished,
  };
  const { error } = await supabase.from("projects").upsert(project);

  if (error) {
    console.error("Unable to save a SpaceEnvy project.", error);
    if (error.code === "23505") {
      return { success: false, message: "That project URL is already in use." };
    }
    throw new Error("Project could not be saved. Please try again.");
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true, message: "Project saved." };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  if (!id || id.length > 64) {
    return { success: false, message: "A valid project is required." };
  }

  const { supabase } = await requireAdmin();
  const { data: project, error: readError } = await supabase
    .from("projects")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("Unable to load the project before deletion.", readError);
    throw new Error("Project could not be loaded. Please try again.");
  }
  if (!project) return { success: false, message: "This project no longer exists." };

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Unable to delete a SpaceEnvy project.", error);
    throw new Error("Project could not be deleted. Please try again.");
  }

  if (project.image_path) {
    const { error: storageError } = await supabase.storage
      .from("project-images")
      .remove([project.image_path]);
    if (storageError) {
      console.error("The project was deleted, but its image could not be removed.", storageError);
      revalidatePath("/");
      revalidatePath("/projects");
      revalidatePath("/admin/projects");
      return {
        success: false,
        message: "Project deleted, but its image could not be removed from storage.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true, message: "Project deleted." };
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  if (!id || id.length > 64) {
    return { success: false, message: "A valid enquiry is required." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Unable to delete a SpaceEnvy enquiry.", error);
    throw new Error("Enquiry could not be deleted. Please try again.");
  }
  if (!data) return { success: false, message: "This enquiry no longer exists." };

  revalidatePath("/admin/enquiries");
  return { success: true, message: "Enquiry deleted." };
}

export async function setTestimonialStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<ActionResult> {
  if (!id || id.length > 64 || (status !== "approved" && status !== "rejected")) {
    return { success: false, message: "A valid feedback item and status are required." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Unable to update client feedback status.", error);
    throw new Error("Feedback status could not be updated. Please try again.");
  }
  if (!data) return { success: false, message: "This feedback no longer exists." };

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true, message: `Feedback ${status}.` };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  if (!id || id.length > 64) {
    return { success: false, message: "A valid feedback item is required." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Unable to delete client feedback.", error);
    throw new Error("Feedback could not be deleted. Please try again.");
  }
  if (!data) return { success: false, message: "This feedback no longer exists." };

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true, message: "Feedback deleted." };
}
