import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Project, PublicTestimonial, SiteSettings } from "@/lib/types";

export const defaultHeroImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90";

export const defaultSiteSettings: SiteSettings = {
  id: "home",
  hero_eyebrow: "SpaceEnvy · Hyderabad",
  hero_title: "Spaces that feel like you.",
  hero_description:
    "Thoughtful interiors for the way you live, work, and gather. From the first sketch to the final detail, your vision leads the way.",
  hero_image_url: defaultHeroImage,
  hero_image_path: null,
  about_heading: "Good design should feel like coming home.",
  about_text:
    "SpaceEnvy brings your ideas to life through considered design, clear communication, and careful execution. Every space starts with listening: to how you live, what matters to you, and how you want your space to feel.",
};

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) return defaultSiteSettings;

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "home")
    .maybeSingle();

  if (error) {
    console.error("Unable to load SpaceEnvy homepage content.", error);
    throw new Error("Unable to load homepage content.");
  }

  if (!data) return defaultSiteSettings;

  return {
    ...defaultSiteSettings,
    ...data,
    hero_image_url: data.hero_image_url || defaultHeroImage,
    hero_image_path: data.hero_image_path || null,
  } as SiteSettings;
}

export async function getProjects(status?: Project["status"]) {
  if (!isSupabaseConfigured()) return [] as Project[];

  const supabase = createPublicSupabaseClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load SpaceEnvy projects.", error);
    throw new Error("Unable to load project information.");
  }

  return (data ?? []) as Project[];
}

export async function getApprovedTestimonials() {
  if (!isSupabaseConfigured()) return [] as PublicTestimonial[];

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, client_name, project_type, review")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Unable to load approved SpaceEnvy testimonials.", error);
    throw new Error("Unable to load client testimonials.");
  }

  return (data ?? []) as PublicTestimonial[];
}

function createPublicSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
