import Layout from "@/components/layout/Layout";
import SectionRenderer from "@/components/home/SectionRenderer";
import Seo from "@/components/ui/Seo";
import { fetchServer } from "@/lib/api";
import { buildSeo } from "@/lib/seo";

export default function CharDhamPage({ content, bootstrap }: any) {
  const seo = buildSeo(content?.seo, {
    title: "Char Dham Yatra by Cab — 1, 2 & 3 Dham Packages | TaxiSafar",
    description:
      "Book Char Dham Yatra taxi packages from Delhi, Haridwar, Rishikesh and Dehradun. Fixed itineraries, experienced hill drivers and transparent pricing.",
    path: "/chardham",
  });

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo {...seo} />
      <SectionRenderer sections={content?.sections || []} tab="chardham" bootstrap={bootstrap || {}} />
    </Layout>
  );
}

export async function getStaticProps() {
  const [content, bootstrap] = await Promise.all([
    fetchServer("/content/home?tab=chardham", null),
    fetchServer("/bootstrap", {}),
  ]);
  return { props: { content, bootstrap }, revalidate: 300 };
}
