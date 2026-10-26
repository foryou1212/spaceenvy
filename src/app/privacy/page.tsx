import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy notice",
  alternates: { canonical: "/privacy" },
  description:
    "How SpaceEnvy uses and protects information submitted through its website enquiry form.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="privacy-page page-shell">
        <p className="eyebrow">Your information</p>
        <h1>Privacy notice</h1>
        <p className="privacy-page__updated">Website enquiries · SpaceEnvy, Hyderabad</p>
        <div className="privacy-copy">
          <p>
            When you send an enquiry, SpaceEnvy collects the name and mobile
            number you provide, along with any optional email address, space
            type, location, and project details.
          </p>
          <p>
            If you submit client feedback, SpaceEnvy collects the display name,
            optional project type, feedback text, and your consent to publish it
            if approved. Feedback stays private in a pending or rejected state.
            Only feedback approved by an admin is shown on the website.
          </p>
          <h2>How we use enquiry details</h2>
          <p>
            We use this information to respond to your request and discuss the
            interior-design services you asked about. We record when you agreed
            to this notice. Enquiry records are stored in SpaceEnvy’s Supabase
            project and can be viewed only by approved admin accounts.
          </p>
          <h2>Retention and access</h2>
          <p>
            Enquiries are kept while they are needed to respond to you and
            manage the related business conversation. Feedback is retained
            while it is considered or displayed. Approved admins can remove
            records from the admin workspace. Contact SpaceEnvy through the{" "}
            <Link href="/#enquire">enquiry form</Link> to ask a question about
            information you submitted.
          </p>
          <h2>Before publishing this notice</h2>
          <p>
            This starter notice is not legal advice. SpaceEnvy should add its
            actual business contact details, confirm its retention and handling
            practices, and review the notice against applicable privacy laws
            before launch.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
