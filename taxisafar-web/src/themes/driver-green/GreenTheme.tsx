import { useWebsite } from "@/context/WebsiteContext";
import Header from "./component/Header";
import Hero from "./component/Hero";
import TourPackages from "./component/TourPackages";
import PopularRoutes from "./component/PopularRoutes";
import Features from "./component/Features";
import Services from "./component/Services";
import Testimonials from "./component/Testimonials";
import FAQ from "./component/FAQ";
import Contact from "./component/Contact";
import Footer from "./component/Footer";
import StickyButtons from "./component/StickyButtons";
import ContactModal from "./component/ContactModal";

const GreenTheme = () => {
  const { website } = useWebsite();

  const openContactModal = () => {
    window.dispatchEvent(new CustomEvent("openContactModal"));
  };

  return (
    <div className="bg-white text-zinc-900">
      <Header />
      <Hero />
      {website?.packages?.length > 0 && <TourPackages />}
      {website?.popularPrices?.length > 0 && <PopularRoutes />}

      <Features />
         {website?.reviews?.length > 0 && <Testimonials />}
      <Services />
   
      <FAQ onEnquiry={openContactModal} />
      {website?.sections?.contact && <Contact />}

      <Footer />

      <StickyButtons />
      <ContactModal />
    </div>
  );
};

export default GreenTheme;
