import Link from "next/link";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";

export default function NotFound() {
  return (
    <Layout hideFooter>
      <Seo title="Page not found | TaxiSafar" description="This page doesn't exist." noIndex />
      <div className="container max-w-md py-24 text-center">
        <p className="font-display text-6xl font-bold text-brand-500">404</p>
        <h1 className="mt-4 text-2xl">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The link may be old or mistyped. Start a new search from the home page.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Go to home
        </Link>
      </div>
    </Layout>
  );
}
