import { GetServerSideProps } from "next"
import { WebsiteProvider } from "@/context/WebsiteContext"
import ThemeRenderer from "@/src/themes/ThemeRenderer"

type Props = {
  driverId: string
  themeId: string
}

export default function DriverThemePage({ driverId, themeId }: Props) {
  return (
    <WebsiteProvider driverId={driverId} themeId={themeId}>
      <ThemeRenderer />
    </WebsiteProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.driverId || !params?.themeId) {
    return { notFound: true }
  }

  return {
    props: {
      driverId: params.driverId,
      themeId: params.themeId,
    },
  }
}
