import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import RideSection from "./components/RideSection";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Services from "./components/Services";
import OneWayTrip from "./components/OneWayTrip";
import FAQ from "./components/faq";
import { useWebsite } from "@/context/WebsiteContext";

const ThemeOne = () => {
  const { website } = useWebsite();

  return (
    <div className="bg-white text-zinc-900">
      <Header />
      <Hero />
      {website?.sections?.packages && <RideSection />}
      {website?.sections?.popularPrices && <OneWayTrip />}

      <About />
      <Services />
      {website?.sections?.reviews && <Testimonials />}
      <FAQ />
      {website?.sections?.contact && <Contact />}

      <Footer />
    </div>
  );
};

export default ThemeOne;
