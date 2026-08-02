import { GetServerSideProps } from "next";
import { WebsiteProvider } from "@/context/WebsiteContext";
import ThemeRenderer from "@/src/themes/ThemeRenderer";

/**
 * Driver micro-site route. `src/themes` and `context/WebsiteContext` are
 * carried over untouched and still talk to the separate driver-website
 * backend — nothing in this file changes their behaviour.
 */
export default function DriverSitePage({ driverId, themeId }: { driverId: string; themeId: string }) {
  return (
    <WebsiteProvider driverId={driverId} themeId={themeId}>
      <ThemeRenderer />
    </WebsiteProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const slug = String(params?.slug || "");
  return {
    props: {
      driverId: slug,
      themeId: String(query.theme || ""),
    },
  };
};
