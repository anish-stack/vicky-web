import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import PackageCard from "@/components/packages/PackageCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { fetchServer, request } from "@/lib/api";
import { buildSeo } from "@/lib/seo";

export default function PackagesPage({ packages, meta, bootstrap, content }: any) {
  const [items, setItems] = useState(packages || []);
  const [page, setPage] = useState(meta?.page || 1);
  const [busy, setBusy] = useState(false);
  const hasMore = page < (meta?.last_page || 1);

  const loadMore = async () => {
    setBusy(true);
    try {
      const { data } = await request("get", "/packages", { page: page + 1, items_per_page: 12 });
      setItems((prev: any[]) => [...prev, ...data]);
      setPage((p: number) => p + 1);
    } finally {
      setBusy(false);
    }
  };

  const hero = content?.sections?.find((s: any) => s.sectionType === "hero");
  const seo = buildSeo(content?.seo, {
    title: "Tour Packages by Cab — Fixed Itineraries & All-Inclusive Fares | TaxiSafar",
    description:
      "Browse spiritual and weekend tour packages with fixed itineraries, all-inclusive cab charges, optional hotels and verified drivers.",
    path: "/packages",
  });

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo {...seo} />

      <div className="border-b border-line bg-surface py-12">
        <div className="container">
          <SectionHeading
            heading={hero?.heading || "Tour Packages"}
            subheading={hero?.subheading || "Fixed itineraries, all-inclusive cab charges and optional hotels."}
          />
        </div>
      </div>

      <div className="container py-12">
        {items.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((pkg: any) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-10 text-center">
                <button onClick={loadMore} disabled={busy} className="btn-outline">
                  {busy ? "Loading…" : "Load more packages"}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-sm text-ink-soft">No packages are published yet. Check back soon.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const [bootstrap, content] = await Promise.all([
    fetchServer("/bootstrap", {}),
    fetchServer("/content/packages", null),
  ]);

  let packages: any[] = [];
  let meta: any = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages?items_per_page=12`);
    const json = await res.json();
    packages = json?.data || [];
    meta = json?.meta || null;
  } catch {
    /* render empty state */
  }

  return { props: { packages, meta, bootstrap, content }, revalidate: 300 };
}
