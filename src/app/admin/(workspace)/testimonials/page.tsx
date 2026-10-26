import type { Metadata } from "next";
import { TestimonialManager } from "@/components/admin/testimonial-manager";
import { requireAdmin } from "@/lib/admin-auth";
import type { Testimonial } from "@/lib/types";

export const metadata: Metadata = {
  title: "Client feedback",
  robots: { index: false, follow: false },
};

export default async function AdminTestimonialsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Unable to load client feedback.", error);
    throw new Error("Client feedback could not be loaded.");
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <p className="eyebrow">Public stories, carefully reviewed</p>
        <h1>Client feedback</h1>
        <p>Approve feedback to publish it, or reject it to keep it off the website.</p>
      </div>
      <TestimonialManager testimonials={(data ?? []) as Testimonial[]} />
    </div>
  );
}
