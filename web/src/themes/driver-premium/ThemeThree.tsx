import React, { useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TourPackages from "./components/TourPackages";
import PopularRoutes from "./components/PopularRoutes";
import Features from "./components/Features";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ContactPopup from "./components/ContactPopup";

export default function ThemeThree() {
  const { website } = useWebsite() as any;
  const [openPopup, setOpenPopup] = useState(false);

  return (
    <div className="bg-white text-zinc-900">
      <Header />
      <Hero />
      {website?.packages?.length > 0 && <TourPackages />}
      {website?.popularPrices?.length > 0 && <PopularRoutes />}

      <Features />
      <Services />
      {website?.reviews?.length > 0 && <Testimonials />}
      <FAQ onEnquiry={() => setOpenPopup(true)} />
      {website?.sections?.contact && <Contact />}

      <ContactPopup isOpen={openPopup} onClose={() => setOpenPopup(false)} />

      <Footer />
    </div>
  );
}
