import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"

const WebsiteContext = createContext<any>(null)

export const WebsiteProvider = ({ driverId, themeId, children }: any) => {
  const [website, setWebsite] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchWebsite() {
      const res = await axios.get(
        `http://localhost:3500/api/website/${driverId}`
      )
     
      setWebsite(res.data.data)
      setLoading(false)
    }
    fetchWebsite()
  }, [driverId])

  return (
    <WebsiteContext.Provider value={{ website, themeId, loading }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export const useWebsite = () => useContext(WebsiteContext)
