import dynamic from "next/dynamic"
import { useWebsite } from "@/context/WebsiteContext"

const themes: any = {
  "theme-1": dynamic(() => import("./theme-1/Theme"), { ssr: false }),
  "theme-2": dynamic(() => import("./theme-2/ThemeTwo"), { ssr: false }),
}

export default function ThemeRenderer() {
  const { website, themeId, loading } = useWebsite()
    console.log("Theme",website, themeId, loading)
  if (loading) return <p>Loading...</p>
  if (!website) return <p>Website not found</p>

  // 🔒 security
//   if (String(website.themeId) !== themeId) {
//     return <p>Invalid theme</p>
//   }

  const ThemeComponent = themes[themeId]
  if (!ThemeComponent) return <p>Theme not exists</p>

  return <ThemeComponent website={website} />
}
