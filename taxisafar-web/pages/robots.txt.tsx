import { GetServerSideProps } from "next";
import { SITE_URL } from "@/lib/api";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /vehicles",
    "Disallow: /booking/",
    "Disallow: /booking-confirmed",
    "Disallow: /my-bookings",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function Robots() {
  return null;
}
