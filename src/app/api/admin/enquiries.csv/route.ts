import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { csvCell } from "@/lib/csv";
import type { Enquiry } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured, so enquiries cannot be exported." },
      { status: 503 },
    );
  }

  const { supabase } = await requireAdmin();
  const enquiries: Enquiry[] = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Unable to export client enquiries.", error);
      return NextResponse.json(
        { message: "Enquiries could not be exported." },
        { status: 500 },
      );
    }

    enquiries.push(...((data ?? []) as Enquiry[]));
    if (!data || data.length < pageSize) break;
  }

  const header = [
    "Name",
    "Mobile",
    "Email",
    "Space type",
    "Location",
    "Requirements",
    "Privacy consent recorded at",
    "Submitted at",
  ];
  const rows = enquiries.map((enquiry) => {
    return [
      enquiry.name,
      enquiry.mobile,
      enquiry.email,
      enquiry.space_type,
      enquiry.location,
      enquiry.requirements,
      enquiry.privacy_consent_at,
      enquiry.created_at,
    ];
  });
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="spaceenvy-enquiries.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
