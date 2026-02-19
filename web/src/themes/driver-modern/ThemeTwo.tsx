
import { useWebsite } from "@/context/WebsiteContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TourPackages from "./components/TourPackages";
import PopularRoutes from "./components/PopularRoutes";
import Features from "./components/Features";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

const ThemeTwo = () => {
  const { website } = useWebsite();

  return (
    <div className="bg-white text-zinc-900">
      <Header />
      <Hero />
      {website?.packages.length > 0 && <TourPackages />}
      {website?.popularPrices.length > 0 && <PopularRoutes />}

      <Features />
      <Services />
      {website?.reviews.length > 0 && <Testimonials />}
      <FAQ />
      {/* {website?.sections?.contact && <Contact />} */}

      <Footer />
    </div>
  );
};

export default ThemeTwo;
