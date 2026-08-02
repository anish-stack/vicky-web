import Layout from "@/components/layout/Layout";
import SectionRenderer from "@/components/home/SectionRenderer";
import Seo from "@/components/ui/Seo";
import { fetchServer } from "@/lib/api";
import { buildSeo } from "@/lib/seo";

export default function HotelPage({ content, bootstrap }: any) {
  const seo = buildSeo(content?.seo, {
    title: "Hotel Booking Across India — Verified Stays | TaxiSafar",
    description:
      "Find and book hotels in Delhi, Varanasi, Mumbai and 100+ Indian cities. Free cancellation on most stays and 24/7 support.",
    path: "/hotel",
  });

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo {...seo} />
      <SectionRenderer sections={content?.sections || []} tab="hotel" bootstrap={bootstrap || {}} />
    </Layout>
  );
}

export async function getStaticProps() {
  const [content, bootstrap] = await Promise.all([
    fetchServer("/content/home?tab=hotel", null),
    fetchServer("/bootstrap", {}),
  ]);
  return { props: { content, bootstrap }, revalidate: 300 };
}
