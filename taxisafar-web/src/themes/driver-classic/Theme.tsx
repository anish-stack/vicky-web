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
import FAQTEMP from './components/FAQTEMP'
import { useWebsite } from "@/context/WebsiteContext";

const ThemeOne = () => {
  const { website } = useWebsite();

  return (
    <div className="bg-white text-zinc-900">
      <Header />
      <Hero />
      {website?.packages.length > 0 && <RideSection />}
      {website?.popularPrices.length > 0 && <OneWayTrip />}

      <About />
      <Services />
      {website?.reviews.length > 0 && <Testimonials />}
      <FAQTEMP />
      {website?.sections?.contact && <Contact />}

      <Footer />
    </div>
  );
};

export default ThemeOne;
