import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: {
    default: "SpaceEnvy | Interior Design in Hyderabad",
    template: "%s | SpaceEnvy",
  },
  alternates: { canonical: "/" },
  description:
    "SpaceEnvy creates thoughtful interior design for homes, flats, and commercial spaces in Hyderabad, India.",
  keywords: [
    "interior designer Hyderabad",
    "home interiors Hyderabad",
    "flat interior design",
    "commercial interior design",
    "SpaceEnvy",
  ],
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    siteName: "SpaceEnvy",
    title: "SpaceEnvy | Interior Design in Hyderabad",
    description:
      "Thoughtful interiors for homes, flats, and commercial spaces in Hyderabad.",
  },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "SpaceEnvy",
  description:
    "Thoughtful interior design for homes, flats, and commercial spaces in Hyderabad, India.",
  areaServed: {
    "@type": "City",
    name: "Hyderabad",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressCountry: "IN",
  },
  serviceType: [
    "Home interior design",
    "Apartment interior design",
    "Commercial interior design",
  ],
  ...(process.env.SITE_URL ? { url: process.env.SITE_URL } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfairDisplay.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessSchema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
