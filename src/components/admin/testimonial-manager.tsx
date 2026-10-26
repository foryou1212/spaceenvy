"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteTestimonial,
  setTestimonialStatus,
} from "@/app/admin/(workspace)/actions";
import type { Testimonial } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();

  function updateStatus(status: "approved" | "rejected") {
    setMessage("");
    startTransition(async () => {
      try {
        const result = await setTestimonialStatus(testimonial.id, status);
        setMessage(result.message);
        if (result.success) router.refresh();
      } catch {
        setMessage("Feedback status could not be updated. Please try again.");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Permanently delete feedback from ${testimonial.client_name}?`)) return;
    setMessage("");
    startTransition(async () => {
      try {
        const result = await deleteTestimonial(testimonial.id);
        setMessage(result.message);
        if (result.success) router.refresh();
      } catch {
        setMessage("Feedback could not be deleted. Please try again.");
      }
    });
  }

  return (
    <article className="testimonial-admin-card">
      <div className="testimonial-admin-card__heading">
        <div>
          <h3>{testimonial.client_name}</h3>
          <p>
            {testimonial.project_type || "Project type not provided"} ·{" "}
            {formatDate(testimonial.created_at)}
          </p>
        </div>
        <span className={`testimonial-status testimonial-status--${testimonial.status}`}>
          {testimonial.status}
        </span>
      </div>
      <blockquote>{testimonial.review}</blockquote>
      <div className="testimonial-admin-card__actions">
        {testimonial.status !== "approved" ? (
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={() => updateStatus("approved")}
          >
            Approve
          </button>
        ) : null}
        {testimonial.status !== "rejected" ? (
          <button
            className="admin-secondary-button"
            type="button"
            disabled={busy}
            onClick={() => updateStatus("rejected")}
          >
            Reject / hide
          </button>
        ) : null}
        <button
          className="table-delete"
          type="button"
          disabled={busy}
          onClick={remove}
        >
          Delete
        </button>
      </div>
      {message ? (
        <p className="form-message form-message--muted" role="status">
          {message}
        </p>
      ) : null}
    </article>
  );
}

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [filter, setFilter] = useState<"all" | Testimonial["status"]>("pending");
  const [refreshing, startRefresh] = useTransition();
  const router = useRouter();
  const filteredTestimonials =
    filter === "all"
      ? testimonials
      : testimonials.filter((testimonial) => testimonial.status === filter);

  function refresh() {
    startRefresh(() => router.refresh());
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading">
        <div>
          <p className="eyebrow">Client feedback</p>
          <h2>Review submissions</h2>
        </div>
        <button className="admin-refresh" type="button" onClick={refresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div className="testimonial-filters" aria-label="Filter testimonials">
        {(["pending", "approved", "rejected", "all"] as const).map((status) => (
          <button
            key={status}
            className={filter === status ? "testimonial-filter testimonial-filter--active" : "testimonial-filter"}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {status === "all" ? "All" : status}
            {status === "pending"
              ? ` (${testimonials.filter((item) => item.status === "pending").length})`
              : ""}
          </button>
        ))}
      </div>
      {filteredTestimonials.length ? (
        <div className="testimonial-admin-list">
          {filteredTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>No {filter === "all" ? "" : `${filter} `}feedback here</h2>
          <p>Client submissions will appear here for review.</p>
        </div>
      )}
    </section>
  );
}
