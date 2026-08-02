import { SITE_URL } from "./api";

export type Seo = {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
};

export const buildSeo = (seo: Seo | undefined, fallback: { title: string; description: string; path?: string }) => ({
  title: seo?.metaTitle || fallback.title,
  description: seo?.metaDescription || fallback.description,
  keywords: seo?.metaKeywords?.join(", ") || "",
  image: seo?.ogImage || `${SITE_URL}/og-default.svg`,
  canonical: seo?.canonical || `${SITE_URL}${fallback.path || ""}`,
  noIndex: seo?.noIndex || false,
});

export const organizationJsonLd = (settings: any = {}) => ({
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: settings.site_name || "TaxiSafar",
  url: SITE_URL,
  telephone: settings.support_phone,
  email: settings.support_email,
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  sameAs: Object.values(settings.social || {}).filter(Boolean),
});

export const packageJsonLd = (pkg: any) => ({
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  name: pkg.title,
  description: pkg.shortDescription || pkg.description,
  url: `${SITE_URL}/packages/${pkg.slug}`,
  image: pkg.coverImage,
  touristType: "Pilgrimage",
  itinerary: {
    "@type": "ItemList",
    itemListElement: (pkg.itinerary || []).map((d: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.title,
    })),
  },
  offers: {
    "@type": "Offer",
    price: pkg.startingPrice,
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
  ...(pkg.reviewCount
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: pkg.rating,
          reviewCount: pkg.reviewCount,
        },
      }
    : {}),
});

export const faqJsonLd = (faqs: any[] = []) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});
