"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type SubmissionState =
  | { kind: "idle"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function TestimonialForm() {
  const [state, setState] = useState<SubmissionState>({ kind: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setState({ kind: "idle", message: "" });
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setState({
          kind: "error",
          message: result.message ?? "We could not submit your feedback. Please try again.",
        });
        return;
      }

      form.reset();
      setState({
        kind: "success",
        message: result.message ?? "Thank you. Your feedback has been submitted for review.",
      });
    } catch {
      setState({
        kind: "error",
        message: "We could not connect. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="enquiry-form testimonial-form" onSubmit={submitFeedback}>
      <div className="form-row">
        <label>
          Name to display <span aria-hidden="true">*</span>
          <input
            name="clientName"
            type="text"
            autoComplete="name"
            placeholder="Your name or preferred display name"
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <label>
          Project type (optional)
          <input
            name="projectType"
            type="text"
            placeholder="Home, apartment, office…"
            maxLength={100}
          />
        </label>
      </div>
      <label>
        Your experience <span aria-hidden="true">*</span>
        <textarea
          name="review"
          rows={5}
          minLength={20}
          maxLength={1500}
          placeholder="Share what it was like working with SpaceEnvy."
          required
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Leave this field empty
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="consent-row">
        <input id="testimonialConsent" name="consent" type="checkbox" required />
        <label className="consent-checkbox" htmlFor="testimonialConsent">
          This is my own feedback, and I give SpaceEnvy permission to publish it
          with the display name above if approved. I understand it will remain
          private unless an admin approves it. See the{" "}
          <Link href="/privacy">privacy notice</Link>.
        </label>
      </div>
      <div className="form-submit">
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Send for review"}
          <span aria-hidden="true">↗</span>
        </button>
        <p>Your feedback will not appear publicly until reviewed and approved.</p>
      </div>
      {state.message ? (
        <p
          className={`form-message form-message--${state.kind}`}
          role={state.kind === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
