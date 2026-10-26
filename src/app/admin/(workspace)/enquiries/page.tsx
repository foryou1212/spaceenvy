import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnquiryManager } from "@/components/admin/enquiry-manager";
import { requireAdmin } from "@/lib/admin-auth";
import type { Enquiry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Client enquiries",
  robots: { index: false, follow: false },
};

const pageSize = 50;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const { supabase } = await requireAdmin();
  const { count, error: countError } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Unable to count client enquiries.", countError);
    throw new Error("Client enquiries could not be counted.");
  }

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (page > pageCount) redirect(`/admin/enquiries?page=${pageCount}`);

  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("Unable to load client enquiries.", error);
    throw new Error("Client enquiries could not be loaded.");
  }

  const enquiries = (data ?? []) as Enquiry[];

  return (
    <div className="admin-page">
      <div className="admin-page__heading admin-page__heading--split">
        <div>
          <p className="eyebrow">New conversations</p>
          <h1>Client enquiries</h1>
          <p>Review the requests sent through the SpaceEnvy website.</p>
        </div>
        <Link className="button" href="/api/admin/enquiries.csv">
          Export CSV <span aria-hidden="true">↓</span>
        </Link>
      </div>
      <EnquiryManager
        enquiries={enquiries}
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        total={total}
      />
    </div>
  );
}
