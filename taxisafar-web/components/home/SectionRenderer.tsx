import Hero from "./Hero";
import Destinations from "./Destinations";
import About from "./About";
import FeatureAccordion from "./FeatureAccordion";
import Services from "./Services";
import Testimonials from "./Testimonials";
import PartnerCards from "./PartnerCards";

/**
 * Maps a CMS `sectionType` to its component, so page order and content are
 * both controlled from the backend.
 */
export default function SectionRenderer({
  sections = [],
  tab,
  bootstrap,
}: {
  sections: any[];
  tab: "taxi" | "chardham" | "hotel";
  bootstrap: any;
}) {
  return (
    <>
      {sections.map((section) => {
        switch (section.sectionType) {
          case "hero":
            return <Hero key={section.key} section={section} tab={tab} bootstrap={bootstrap} />;
          case "popularDestinations":
            return <Destinations key={section.key} section={section} />;
          case "aboutUs":
            return <About key={section.key} section={section} />;
          case "featureAccordion":
            return <FeatureAccordion key={section.key} section={section} />;
          case "services":
            return <Services key={section.key} section={section} />;
          case "testimonials":
            return <Testimonials key={section.key} section={section} />;
          case "partnerCards":
            return <PartnerCards key={section.key} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
