import { useWebsite } from "@/context/WebsiteContext";
import Header from "./component/Header";

const GreenTheme = () => {
    const { website } = useWebsite();
  return (
    <div className="bg-white text-zinc-900">
        <Header />
      
    </div>
  )
}

export default GreenTheme
