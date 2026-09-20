import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Packages from "./components/Packages";
import PopularRoutes from "./components/PopularRoutes";
import Features from "./components/Features";
import DriveWithUs from "./components/DriveWithUs";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import { useWebsite } from "@/context/WebsiteContext";

const QuickTheme = () => {
  const { website } = useWebsite();
  const sections = website?.sections || {};

  return (
    <div className="bg-white text-slate-900 antialiased">
      <Header />
      <Hero />
      <Services />
      {sections.packages !== false && website?.packages?.length > 0 && <Packages />}
      {sections.popularPrices !== false && website?.popularPrices?.length > 0 && <PopularRoutes />}
      <Features />
      <DriveWithUs />
      {sections.reviews !== false && website?.reviews?.length > 0 && <Testimonials />}
      <FAQ />
      {sections.contact !== false && <Contact />}
      
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default QuickTheme;
