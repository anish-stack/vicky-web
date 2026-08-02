import Link from "next/link";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";

export default function ServerError() {
  return (
    <Layout hideFooter>
      <Seo title="Something went wrong | TaxiSafar" description="An unexpected error occurred." noIndex />
      <div className="container max-w-md py-24 text-center">
        <h1 className="text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The page couldn&apos;t load. Refresh to try again, or head back to the home page.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Go to home
        </Link>
      </div>
    </Layout>
  );
}
