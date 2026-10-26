import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description:
    "Meet SpaceEnvy, a Hyderabad interior design studio creating personal homes, apartments, and commercial spaces.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="loading-public" aria-label="Loading about SpaceEnvy" />}>
        <AboutContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function AboutContent() {
  const settings = await getSiteSettings();

  return (
      <main>
        <section className="page-hero page-shell">
          <p className="eyebrow">A little about us</p>
          <h1>Design that starts with you.</h1>
          <p>
            SpaceEnvy is an interior design studio in Hyderabad, bringing
            thoughtful ideas and careful execution together.
          </p>
        </section>
        <section className="about-story page-shell">
          <div className="about-story__image">
            <Image
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85"
              alt="Quiet, welcoming interior with natural materials"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
          <div className="about-story__copy">
            <p className="eyebrow">Our point of view</p>
            <h2>{settings.about_heading}</h2>
            <p>{settings.about_text}</p>
            <p>
              We believe a great result is more than a beautiful room. It is a
              process where you feel heard, the choices make sense, and the
              finished space feels right for the people who use it.
            </p>
            <div className="about-signoff">
              <span className="about-signoff__mark">S</span>
              <span>SpaceEnvy · Hyderabad</span>
            </div>
          </div>
        </section>
        <section className="values-section">
          <div className="page-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">What you can expect</p>
                <h2>Care in every detail.</h2>
              </div>
            </div>
            <div className="value-grid">
              <article>
                <span>01</span>
                <h3>We listen first</h3>
                <p>Your priorities shape the brief, the choices, and the result.</p>
              </article>
              <article>
                <span>02</span>
                <h3>We design with purpose</h3>
                <p>Every material and detail earns its place in your space.</p>
              </article>
              <article>
                <span>03</span>
                <h3>We follow through</h3>
                <p>Clear communication and attentive coordination at each step.</p>
              </article>
            </div>
          </div>
        </section>
      </main>
  );
}
