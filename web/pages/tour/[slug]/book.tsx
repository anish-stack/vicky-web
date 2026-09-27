import Head from "next/head";
import type { GetServerSideProps } from "next";
import { Selection, TourPackage, getTourBySlug, readSelection } from "@/lib/tourPackage";
import BookingSelector from "@/components/tour/BookingSelector";

type Props = { tour: TourPackage; initial: Selection };

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
  const tour = await getTourBySlug(String(params?.slug || ""));
  if (!tour) return { notFound: true };
  return { props: { tour, initial: readSelection(query) } };
};

export default function TourBookPage({ tour, initial }: Props) {
  return (
    <>
      <Head>
        <title>{`Select vehicle & hotel · ${tour.title}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <BookingSelector tour={tour} initial={initial} />
    </>
  );
}