import { GetServerSideProps } from "next";
import { API_URL, SITE_URL } from "@/lib/api";

const STATIC = ["", "/chardham", "/hotel", "/packages", "/contact", "/faq"];

function url(loc: string, lastmod?: string, priority = "0.7") {
  return `<url><loc>${SITE_URL}${loc}</loc>${
    lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""
  }<changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let data: any = {};
  try {
    const r = await fetch(`${API_URL}/sitemap-data`);
    data = (await r.json())?.data || {};
  } catch {
    /* fall back to static routes only */
  }

  const entries = [
    ...STATIC.map((p) => url(p, undefined, p === "" ? "1.0" : "0.8")),
    ...(data.packages || []).map((p: any) => url(`/packages/${p.slug}`, p.updatedAt, "0.9")),
    ...(data.dhamPackages || []).map((p: any) => url(`/chardham/${p.slug}`, p.updatedAt)),
    ...(data.destinations || []).map((d: any) => url(`/destinations/${d.slug}`, d.updatedAt)),
    ...(data.services || []).map((s: any) => url(`/services/${s.slug}`, s.updatedAt, "0.6")),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join(
    ""
  )}</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
