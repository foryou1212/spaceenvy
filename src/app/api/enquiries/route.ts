import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

type EnquiryInput = {
  name?: unknown;
  mobile?: unknown;
  email?: unknown;
  spaceType?: unknown;
  location?: unknown;
  requirements?: unknown;
  companyWebsite?: unknown;
  privacyConsent?: unknown;
};

const phonePattern = /^[+]?[0-9][0-9 ()().-]{6,18}[0-9]$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Enquiry submissions are not available until Supabase is configured." },
      { status: 503 },
    );
  }

  let body: EnquiryInput;
  try {
    body = (await request.json()) as EnquiryInput;
  } catch {
    return NextResponse.json({ message: "Please submit a valid enquiry." }, { status: 400 });
  }

  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return NextResponse.json({ message: "Enquiry received." }, { status: 201 });
  }
  if (body.privacyConsent !== true && body.privacyConsent !== "on") {
    return NextResponse.json(
      { message: "Please agree to the privacy notice before sending your enquiry." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const spaceType = typeof body.spaceType === "string" ? body.spaceType.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const requirements =
    typeof body.requirements === "string" ? body.requirements.trim() : "";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json(
      { message: "Please enter your name (2–120 characters)." },
      { status: 400 },
    );
  }
  if (!phonePattern.test(mobile)) {
    return NextResponse.json(
      { message: "Please enter a valid mobile number." },
      { status: 400 },
    );
  }
  if (email && (email.length > 254 || !emailPattern.test(email))) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (spaceType.length > 100 || location.length > 160 || requirements.length > 4000) {
    return NextResponse.json(
      { message: "Some enquiry details are too long. Please shorten them and try again." },
      { status: 400 },
    );
  }

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("enquiries").insert({
    name,
    mobile,
    email: email || null,
    space_type: spaceType || null,
    location: location || null,
    requirements: requirements || null,
    privacy_consent_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Unable to save a SpaceEnvy enquiry.", error);
    return NextResponse.json(
      { message: "We could not save your enquiry. Please try again shortly." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Thank you. Your enquiry has been received." },
    { status: 201 },
  );
}
