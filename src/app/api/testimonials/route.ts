import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

type TestimonialInput = {
  clientName?: unknown;
  projectType?: unknown;
  review?: unknown;
  consent?: unknown;
  companyWebsite?: unknown;
};

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Feedback submissions are not available until Supabase is configured." },
      { status: 503 },
    );
  }

  let body: TestimonialInput;
  try {
    body = (await request.json()) as TestimonialInput;
  } catch {
    return NextResponse.json({ message: "Please submit valid feedback." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Please submit valid feedback." }, { status: 400 });
  }

  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return NextResponse.json({ message: "Thank you. Your feedback was submitted for review." }, { status: 201 });
  }
  if (body.consent !== true && body.consent !== "on") {
    return NextResponse.json(
      { message: "Please confirm that SpaceEnvy may publish your feedback if approved." },
      { status: 400 },
    );
  }

  const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
  const projectType = typeof body.projectType === "string" ? body.projectType.trim() : "";
  const review = typeof body.review === "string" ? body.review.trim() : "";

  if (clientName.length < 2 || clientName.length > 80) {
    return NextResponse.json(
      { message: "Enter the name you would like displayed (2–80 characters)." },
      { status: 400 },
    );
  }
  if (projectType.length > 100 || review.length < 20 || review.length > 1500) {
    return NextResponse.json(
      { message: "Add feedback between 20 and 1,500 characters and check the optional project detail." },
      { status: 400 },
    );
  }

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("testimonials").insert({
    client_name: clientName,
    project_type: projectType || null,
    review,
    status: "pending",
    consent_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Unable to save SpaceEnvy client feedback.", error);
    return NextResponse.json(
      { message: "We could not save your feedback. Please try again shortly." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Thank you. Your feedback has been submitted for review." },
    { status: 201 },
  );
}
