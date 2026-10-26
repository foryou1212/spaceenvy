"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type SubmissionState =
  | { kind: "idle"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function EnquiryForm() {
  const [state, setState] = useState<SubmissionState>({
    kind: "idle",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setState({ kind: "idle", message: "" });

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setState({
          kind: "error",
          message: result.message ?? "We could not send your enquiry. Please try again.",
        });
        return;
      }

      form.reset();
      setState({
        kind: "success",
        message: "Thank you. Your enquiry is with our design team.",
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
    <form className="enquiry-form" onSubmit={submitEnquiry}>
      <div className="form-row">
        <label>
          Your name <span aria-hidden="true">*</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="How should we address you?"
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <label>
          Mobile number <span aria-hidden="true">*</span>
          <input
            name="mobile"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            pattern="[+]?[0-9][0-9 ()().-]{6,18}[0-9]"
            title="Enter a valid phone number with at least 8 digits."
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={254}
          />
        </label>
        <label>
          What are you designing?
          <select name="spaceType" defaultValue="">
            <option value="">Choose a space type</option>
            <option value="Home">Home</option>
            <option value="Flat or apartment">Flat or apartment</option>
            <option value="Commercial space">Commercial space</option>
            <option value="Other">Something else</option>
          </select>
        </label>
      </div>
      <label>
        A little about your space
        <textarea
          name="requirements"
          rows={4}
          maxLength={4000}
          placeholder="Tell us what you have in mind, your location, or anything you'd like us to know."
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Leave this field empty
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="consent-row">
        <input id="privacyConsent" name="privacyConsent" type="checkbox" required />
        <label className="consent-checkbox" htmlFor="privacyConsent">
          I agree that SpaceEnvy may use these details to respond to my enquiry.
          See the <Link href="/privacy">privacy notice</Link>.
        </label>
      </div>
      <div className="form-submit">
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send enquiry"}
          <span aria-hidden="true">↗</span>
        </button>
        <p>Our design team will review your enquiry and get back to you.</p>
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
