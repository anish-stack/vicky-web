import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import Skeleton from "@/components/ui/Skeleton";
import { fetchServer, request } from "@/lib/api";
import { inr } from "@/lib/format";

export default function BookingConfirmed({ bootstrap }: any) {
  const router = useRouter();
  const { invoice } = router.query;
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoice) return;
    request("get", `/payments/${invoice}`)
      .then(({ data }) => setTransaction(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [invoice]);

  return (
    <Layout settings={bootstrap?.settings} compactHeader>
      <Seo title="Booking confirmed | TaxiSafar" description="Your booking is confirmed." noIndex />

      <div className="container max-w-lg py-16 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ECFDF5] text-[#047857]">
          <CheckCircle2 size={32} />
        </span>

        <h1 className="mt-6 text-2xl">Booking confirmed</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We&apos;ve sent the details to your WhatsApp. Our team will call you before pickup.
        </p>

        {loading ? (
          <Skeleton className="mx-auto mt-8 h-28 w-full" />
        ) : transaction ? (
          <dl className="card mt-8 space-y-2.5 p-5 text-left text-xs">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Invoice</dt>
              <dd className="font-medium">{transaction.invoiceId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Amount paid</dt>
              <dd className="font-medium">{inr(transaction.paidAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Payment method</dt>
              <dd className="font-medium capitalize">{transaction.method || "—"}</dd>
            </div>
          </dl>
        ) : null}

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/my-bookings" className="btn-dark">
            View my bookings
          </Link>
          <Link href="/" className="btn-outline">
            Back to home
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const bootstrap = await fetchServer("/bootstrap", {});
  return { props: { bootstrap }, revalidate: 600 };
}
