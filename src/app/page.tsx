import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/enquiry-form";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TestimonialForm } from "@/components/testimonial-form";
import { WhatsAppContact } from "@/components/whatsapp-contact";
import { getApprovedTestimonials, getProjects, getSiteSettings } from "@/lib/content";

function HomeLoading() {
  return <div className="loading-public" aria-label="Loading SpaceEnvy content" />;
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function HomeContent() {
  const [settings, projects, testimonials] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getApprovedTestimonials(),
  ]);
  const featuredProjects = projects.slice(0, 3);

  return (
      <main>
        <section className="hero">
          <Image
            src={settings.hero_image_url}
            alt="Warm, sunlit living room with layered natural textures"
            fill
            priority
            sizes="100vw"
            className="hero__image"
          />
          <div className="hero__shade" />
          <div className="hero__content page-shell">
            <p className="eyebrow eyebrow--light">{settings.hero_eyebrow}</p>
            <h1>{settings.hero_title}</h1>
            <p className="hero__description">{settings.hero_description}</p>
            <div className="hero__actions">
              <Link className="button button--light" href="#enquire">
                Let’s talk about your space <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link text-link--light" href="/projects">
                Explore our work <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
          <div className="hero__caption">Considered interiors · Hyderabad</div>
          <a className="hero__scroll" href="#intro" aria-label="Scroll to discover">
            <span aria-hidden="true">↓</span>
          </a>
        </section>

        <section className="intro-section page-shell" id="intro">
          <div className="intro-section__label">
            <span className="section-index">01</span>
            <span>Spaces with a point of view</span>
          </div>
          <div className="intro-section__body">
            <h2>
              Your space, your story.
              <br />
              <span>Let’s make it feel like home.</span>
            </h2>
            <p>
              From a fresh start to a thoughtful refresh, we bring design and
              delivery together. Clear conversations, considered details, and a
              space that feels unmistakably yours.
            </p>
            <Link className="text-link" href="/about">
              Get to know SpaceEnvy <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className="services-section">
          <div className="page-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Made for the way you live</p>
                <h2>Every space begins with listening.</h2>
              </div>
              <p>
                Thoughtful design, practical choices, and attentive execution
                from first conversation to final handover.
              </p>
            </div>
            <div className="service-grid">
              <article className="service-card">
                <span className="service-card__number">01</span>
                <h3>Homes & apartments</h3>
                <p>
                  Personal, practical interiors that make everyday routines feel
                  a little more considered.
                </p>
                <span className="service-card__arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
              <article className="service-card">
                <span className="service-card__number">02</span>
                <h3>Commercial spaces</h3>
                <p>
                  Welcoming, purposeful environments that reflect how your
                  people and business work.
                </p>
                <span className="service-card__arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
              <article className="service-card">
                <span className="service-card__number">03</span>
                <h3>Design & delivery</h3>
                <p>
                  One considered journey from concept and material choices to
                  the finishing details.
                </p>
                <span className="service-card__arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            </div>
          </div>
        </section>

        <section className="projects-section page-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A little inspiration</p>
              <h2>Spaces in the making.</h2>
            </div>
            <Link className="text-link" href="/projects">
              Upcoming & completed <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {featuredProjects.length > 0 ? (
            <div className="project-grid">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="projects-empty">
              <span className="projects-empty__mark" aria-hidden="true">
                S
              </span>
              <div>
                <h3>Every project has a beginning.</h3>
                <p>
                  Project stories will appear here as they are added to our
                  portfolio. In the meantime, tell us what you’d love to create.
                </p>
              </div>
              <Link className="text-link" href="#enquire">
                Share your idea <span aria-hidden="true">↗</span>
              </Link>
            </div>
          )}
        </section>

        {testimonials.length ? (
          <section className="testimonials-section page-shell" aria-labelledby="testimonials-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Kind words from clients</p>
                <h2 id="testimonials-title">Experiences, in their own words.</h2>
              </div>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <figure className="testimonial-card" key={testimonial.id}>
                  <span className="testimonial-card__quote" aria-hidden="true">“</span>
                  <blockquote>{testimonial.review}</blockquote>
                  <figcaption>
                    <strong>{testimonial.client_name}</strong>
                    {testimonial.project_type ? <span>{testimonial.project_type}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <section className="approach-section">
          <div className="approach-section__image">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85"
              alt="Carefully composed living space in natural tones"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              className="approach-section__photo"
            />
          </div>
          <div className="approach-section__content">
            <p className="eyebrow">A thoughtful process</p>
            <h2>Good design is a conversation.</h2>
            <p>
              We start by understanding what matters to you, then shape a clear
              direction together. No guesswork, no surprises—just considered
              decisions and a team that keeps you in the loop.
            </p>
            <div className="approach-points">
              <span>01 <b>Listen & understand</b></span>
              <span>02 <b>Design with intention</b></span>
              <span>03 <b>Deliver with care</b></span>
            </div>
            <Link className="text-link" href="/about">
              More about our approach <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className="review-section page-shell" id="share-feedback">
          <div className="review-section__intro">
            <p className="eyebrow">Have worked with SpaceEnvy?</p>
            <h2>Share your experience.</h2>
            <p>
              Your feedback is sent privately for review. It appears on this
              website only if an admin approves it.
            </p>
          </div>
          <TestimonialForm />
        </section>

        <section className="enquiry-section page-shell" id="enquire">
          <div className="enquiry-section__intro">
            <p className="eyebrow">Your next chapter starts here</p>
            <h2>Tell us what you’re imagining.</h2>
            <p>
              A few details are all we need to start a thoughtful conversation
              about your space.
            </p>
            <div className="enquiry-note">
              <span className="enquiry-note__dot" />
              <span>Based in Hyderabad · Working across the city</span>
            </div>
            <WhatsAppContact />
          </div>
          <EnquiryForm />
        </section>
        </main>
  );
}
