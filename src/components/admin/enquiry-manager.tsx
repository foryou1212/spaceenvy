"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEnquiry } from "@/app/admin/(workspace)/actions";
import type { Enquiry } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [deleting, startDeleting] = useTransition();

  function removeEnquiry() {
    if (!window.confirm(`Delete the enquiry from ${enquiry.name}? This cannot be undone.`)) {
      return;
    }

    setMessage("");
    startDeleting(async () => {
      try {
        const result = await deleteEnquiry(enquiry.id);
        setMessage(result.message);
        if (result.success) router.refresh();
      } catch {
        setMessage("Enquiry could not be deleted. Please try again.");
      }
    });
  }

  return (
    <>
      <tr>
        <td>
          <strong>{enquiry.name}</strong>
          <small>{formatDate(enquiry.created_at)}</small>
        </td>
        <td>
          <a href={`tel:${enquiry.mobile}`}>{enquiry.mobile}</a>
          {enquiry.email ? (
            <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
          ) : null}
        </td>
        <td>{enquiry.space_type || "—"}</td>
        <td>{enquiry.location || "—"}</td>
        <td className="enquiry-table__requirements">
          {enquiry.requirements || "—"}
        </td>
        <td>
          <button
            className="table-delete"
            type="button"
            onClick={removeEnquiry}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </td>
      </tr>
      {message ? (
        <tr>
          <td colSpan={6}>
            <p className="form-message form-message--error" role="alert">
              {message}
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function EnquiryManager({
  enquiries,
  page,
  pageCount,
  pageSize,
  total,
}: {
  enquiries: Enquiry[];
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();

  if (!enquiries.length) {
    return (
      <div className="admin-panel admin-empty">
        <span className="projects-empty__mark" aria-hidden="true">
          S
        </span>
        <h2>No enquiries yet</h2>
        <p>New client requests will appear here when they submit the website form.</p>
      </div>
    );
  }

  return (
    <section className="admin-panel enquiry-table-panel">
      <div className="admin-panel__heading">
        <div>
          <p className="eyebrow">Enquiry inbox</p>
          <h2>{total} requests</h2>
        </div>
        <button
          className="admin-refresh"
          type="button"
          onClick={() => router.refresh()}
        >
          Refresh
        </button>
      </div>
      <div className="table-scroll">
        <table className="enquiry-table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Contact</th>
              <th scope="col">Space</th>
              <th scope="col">Location</th>
              <th scope="col">Requirements</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        Enquiries contain personal contact details. Export and share them with care.
      </p>
      {pageCount > 1 ? (
        <div className="table-pagination">
          <span>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} of {total}
          </span>
          <div>
            {page > 1 ? (
              <a href={`/admin/enquiries?page=${page - 1}`}>Previous</a>
            ) : (
              <span aria-disabled="true">Previous</span>
            )}
            <span>
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <a href={`/admin/enquiries?page=${page + 1}`}>Next</a>
            ) : (
              <span aria-disabled="true">Next</span>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
