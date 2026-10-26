export type SiteSettings = {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image_url: string;
  hero_image_path: string | null;
  about_heading: string;
  about_text: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  status: "upcoming" | "completed";
  description: string;
  image_url: string | null;
  image_path: string | null;
  is_published: boolean;
  created_at: string;
};

export type Enquiry = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  space_type: string | null;
  location: string | null;
  requirements: string | null;
  privacy_consent_at: string;
  created_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  project_type: string | null;
  review: string;
  status: "pending" | "approved" | "rejected";
  consent_at: string;
  created_at: string;
  updated_at: string;
};

export type PublicTestimonial = Pick<
  Testimonial,
  "id" | "client_name" | "project_type" | "review"
>;
