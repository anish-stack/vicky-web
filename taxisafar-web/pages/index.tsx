import Layout from "@/components/layout/Layout";
import SectionRenderer from "@/components/home/SectionRenderer";
import Seo from "@/components/ui/Seo";
import { fetchServer } from "@/lib/api";
import { buildSeo, organizationJsonLd } from "@/lib/seo";

export default function HomePage({ content, bootstrap }: any) {
  const seo = buildSeo(content?.seo, {
    title: "TaxiSafar — Outstation Cabs, Char Dham Yatra & Hotels Across India",
    description:
      "Book outstation taxis, Char Dham Yatra packages and hotels with transparent pricing, verified drivers and 24/7 support.",
    path: "/",
  });

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo {...seo} jsonLd={organizationJsonLd(bootstrap?.settings)} />
      <SectionRenderer sections={content?.sections || []} tab="taxi" bootstrap={bootstrap || {}} />
    </Layout>
  );
}

export async function getStaticProps() {
  const [content, bootstrap] = await Promise.all([
    fetchServer("/content/home?tab=taxi", null),
    fetchServer("/bootstrap", {}),
  ]);
  return { props: { content, bootstrap }, revalidate: 300 };
}
