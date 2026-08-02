import Header from "./components/Header";
import Hero from "./components/Hero";
import Fleet from "./components/Fleet";
import TourPackages from "./components/TourPackages";
import PopularRoutes from "./components/PopularRoutes";
import Features from "./components/Features";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { useWebsite } from "@/context/WebsiteContext";

const ApnaTaxiTheme = () => {
  const { website } = useWebsite();

  return (
    <div className="bg-[#fffdf5] text-slate-900 antialiased">
      <Header />
      <Hero />
      <Fleet />
      {website?.packages?.length > 0 && <TourPackages />}
      {website?.popularPrices?.length > 0 && <PopularRoutes />}
      <Features />
      <Services />
      {website?.reviews?.length > 0 && <Testimonials />}
      <FAQ />
      {website?.sections?.contact && <Contact />}
      <Footer />
    </div>
  );
};

export default ApnaTaxiTheme;
