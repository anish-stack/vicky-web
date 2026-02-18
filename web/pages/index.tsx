import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { GetServerSideProps } from "next";

import BannerSectionTwo from "@/components/banners/HomeBanner/Two";
import HomeDestination from "@/components/taxisafar/homeDestination";
import HomeAbout from "@/components/taxisafar/homeAbout";
import HomeOutstationService from "@/components/taxisafar/homeOutstationService";
import HomeService from "@/components/taxisafar/homeService";
import HomeJoinNetwork from "@/components/taxisafar/homeJoinNetwork";
import HomeCustomerReview from "@/components/taxisafar/homeCustomerReview";

import ThemeRenderer from "@/src/themes/ThemeRenderer";
import { WebsiteProvider } from "@/context/WebsiteContext";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

interface Destination {
  imgSrc: string;
  title: string;
  tripsDays: string;
}

interface OutstationService {
  id: number;
  number: string;
  title: string;
  description: string;
}

interface Slide {
  imageUrl: string;
  videoUrl: string;
}

interface Service {
  imgSrc: string;
  title: string;
  description: string;
}

interface NetworkItem {
  imgSrc: string;
  title: string;
  description: string;
  link?: string;
  serviceType: string;
}

interface TestimonialUser {
  name: string;
  designation: string;
  image: string;
}

interface Testimonial {
  rating: number;
  description: string;
  user: TestimonialUser;
}

interface HomeProps {
  isDriverWebsite: boolean;
  driverId: string | null;
  themeId: string | null;

  blocked: boolean;
  blockType: "not_live" | "payment_failed" | "expired" | null;
  reason: string | null;
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export default function Home({
  isDriverWebsite,
  driverId,
  themeId,
  blocked,
  blockType,
  reason,
}: HomeProps) {
  const router = useRouter();

  // ===== DATA (your existing) =====

  const destinations: Destination[] = [
    {
      imgSrc: "/images/destinations/rishikesh-place-to-visit.png",
      title: "New Delhi To Haridwar, Rishikesh",
      tripsDays: "Round Trip | 2 Days",
    },
    {
      imgSrc: "/images/destinations/mathura-and-vrindavan.jpg",
      title: "New Delhi To Mathura Vrindavan UP",
      tripsDays: "Round Trip | 2 Days",
    },
    {
      imgSrc: "/images/destinations/snow-manali.jpg",
      title: "New Delhi To Shimla, Manali",
      tripsDays: "Round Trip | 5 Days",
    },
    {
      imgSrc: "/images/destinations/jaipur.jpg",
      title: "New Delhi To Jaipur, Rajasthan",
      tripsDays: "Round Trip | 3 Days",
    },
  ];

  const outstationServices: OutstationService[] = [
    {
      id: 1,
      number: "01",
      title: "What types of vehicles are available for outstation travel?",
      description:
        "We offer multiple vehicle options such as Hatchback (WagonR, Swift), Sedan (Dzire), SUV (Ertiga, Innova Crysta), or similar based on availability and your booking choice.",
    },
    {
      id: 2,
      number: "02",
      title: "Can I book a one-way or round trip?",
      description:
        "Yes, you can book both one-way and round trips. The fare for a one-way trip depends on the distance and destination city. In some cases, a return fare may also apply.",
    },
    {
      id: 3,
      number: "03",
      title: "Are toll taxes and other charges included in the fare?",
      description:
        "We offer two pricing options:\n\nBest Price: Toll and parking charges are extra.\nAll-Inclusive Price: Toll and driver charges are included; parking charges are separate.",
    },
    {
      id: 4,
      number: "04",
      title: "How will I get driver and vehicle details after booking?",
      description:
        "Once your booking is confirmed, you can find the driver and vehicle details in the 'My Trips' section under your profile on the website homepage.",
    },
    {
      id: 5,
      number: "05",
      title: "Is it safe to travel at night or in remote areas?",
      description:
        "Yes, all our drivers are verified, and we provide 24x7 customer support along with an SOS emergency feature for your safety.",
    },
    {
      id: 6,
      number: "06",
      title: "Can I modify or cancel my booking?",
      description:
        "Yes, you can modify or cancel your booking as per our Cancellation Policy available on the website.",
    },
  ];

  const outstationSlides: Slide[] = [
    {
      imageUrl: "/images/resource/outstation.jpg",
      videoUrl: "https://youtu.be/18cjF9f5fT0",
    },
    {
      imageUrl: "/images/resource/outstation.jpg",
      videoUrl: "https://youtu.be/18cjF9f5fT0",
    },
  ];

  const latestServices: Service[] = [
    {
      imgSrc: "/images/services/airport-transfer.jpg",
      title: "Airport Transport",
      description:
        "Enjoy a smooth airport ride with our reliable cabs. Simply select your airport, pickup, and drop-off city!",
    },
    {
      imgSrc: "/images/services/online-booking.jpg",
      title: "Online Booking",
      description:
        "Book your cab online in seconds! Enjoy safe, comfortable, and reliable rides anytime, anywhere.",
    },
    {
      imgSrc: "/images/services/local-rental.jpg",
      title: "Local Rental",
      description:
        "Travel effortlessly with our city transport service—fixed-hour and kilometer packages for a smooth, reliable ride.",
    },
  ];

  const networkItems: NetworkItem[] = [
    {
      imgSrc: "/images/our-network/driver.jpg",
      title: "Become a Driver or Attach Your Taxi",
      description:
        "Official Taxi Safar Discussion Group Bookings.<br/>Taxi Attachment & All Updates<br/>(Only For Taxi Owners & Drivers)",
      link: "/welcome_to_taxisafar_notice",
      serviceType: "Taxi Attach",
    },
    {
      imgSrc: "/images/our-network/booking.jpg",
      title: "Booking Management",
      description:
        "Partner with us! Access the admin panel to manage bookings in your city or specific areas.",
      serviceType: "Booking Panel",
    },
    {
      imgSrc: "/images/our-network/hotel.jpg",
      title: "List Your Hotel",
      description:
        "List your hotel and connect with travelers. Get started by filling out the form.",
      serviceType: "Hotel List",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      rating: 5,
      description:
        "The ride was smooth, the driver was courteous, and the cab was clean. I felt safe throughout my journey. Highly recommended!",
      user: {
        name: "Payal Goswami",
        designation: "CEO & Founder",
        image: "/images/user/user-profile-1.png",
      },
    },
    {
      rating: 5,
      description:
        "The ride was smooth, the driver was courteous, and the cab was clean. I felt safe throughout my journey. Highly recommended!",
      user: {
        name: "Payal Goswami",
        designation: "CEO & Founder",
        image: "/images/user/user-profile-1.png",
      },
    },
  ];

  // ────────────────────────────────────────────────
  // Scroll Helpers
  // ────────────────────────────────────────────────

  const scrollToHash = (offset = 100): void => {
    if (!window.location.hash) return;

    const id = window.location.hash.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleBookTaxi = (): void => {
    router
      .push({
        pathname: "/",
        hash: "navigate-to-top",
      })
      .then(() => {
        setTimeout(() => scrollToHash(100), 100);
      });
  };

  const handleOutstationTaxi = (): void => {
    router
      .push({
        pathname: "/",
        query: {
          taxisafar_category: "outstation",
          taxisafar_triptype: "oneWay",
        },
        hash: "navigate-to-top",
      })
      .then(() => {
        setTimeout(() => scrollToHash(100), 100);
      });
  };

  useEffect(() => {
    if (window.location.hash) {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => scrollToHash(100), 50);

    const handleHashChange = (): void => {
      scrollToHash(100);
    };

    router.events.on("hashChangeComplete", handleHashChange);

    return () => {
      router.events.off("hashChangeComplete", handleHashChange);
      clearTimeout(timer);
    };
  }, [router]);

  // ────────────────────────────────────────────────
  // DRIVER WEBSITE RENDER
  // ────────────────────────────────────────────────

  if (isDriverWebsite) {
    if (blocked) {
      return (
        <div style={{ padding: 40 }}>
          <h1>Website Blocked</h1>
          <p>
            <b>Type:</b> {blockType}
          </p>
          <p>{reason}</p>
        </div>
      );
    }

    return (
      <WebsiteProvider driverId={driverId} themeId={themeId}>
        <ThemeRenderer />
      </WebsiteProvider>
    );
  }

  // ────────────────────────────────────────────────
  // MAIN WEBSITE RENDER
  // ────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>
          Taxi Safar – One Way & Round Trip Cabs | Char Dham Yatra Taxi & Hotel
          Booking India
        </title>
        <meta
          name="description"
          content="Book trusted one way and round trip taxis across India with TaxiSafar. Special Char Dham Yatra taxi packages from Delhi. Affordable hotel booking & 24x7 support."
        />
      </Head>

      <div>
        <BannerSectionTwo
          imageURL="/images/banner/taxxisafar-taxi-banner.jpg"
          heading="All India Taxi Service"
        />

        <HomeDestination
          title="Explore Popular Destination"
          description="Enjoy hassle-free weekends with our affordable, top-rated outstation tour packages. <br /> Explore popular destinations effortlessly!"
          destinations={destinations}
        />

        <HomeAbout
          title="Welcome to TaxiSafar"
          subtitle="Reliable cab services <br /> for your journey"
          description="With professional drivers and well-maintained vehicles, we guarantee timely pickups and smooth travel to your destination."
          highlightDescription="Our reliable cab services ensure a safe, comfortable, and hassle-free journey."
          buttonName="Book a Taxi"
          videoLink="https://youtu.be/18cjF9f5fT0"
          imageURL="/images/resource/about-taxisafar.jpg"
          handleBookTaxi={handleBookTaxi}
        />

        <HomeOutstationService
          title="Best Outstation Taxi <br /> Services"
          outstationServices={outstationServices}
          OutstationslidesData={outstationSlides}
          buttonName="Book Outstation Cab"
          handleOutstationTaxi={handleOutstationTaxi}
        />

        <HomeService
          title="Latest Services"
          subtitle="Explore our top-rated services"
          latestServices={latestServices}
        />

        <HomeCustomerReview
          title="Customer Reviews"
          subtitle="Bringing Countless <br /> Smiles through Our <br /> TaxiSafar"
          description="Spreading joy, one ride at a time. Safe, reliable, and comfortable taxi services for every journey!"
          satisfactionRate="97"
          experience="9"
          testimonials={testimonials}
          reviewOneImg="/images/reviews/review-one.jpg"
          reviewTwoImg="/images/reviews/review-two.jpg"
        />

        <HomeJoinNetwork
          title="Partner & Grow With Us"
          subtitle="Join Our Network & Unlock Opportunities"
          networkItems={networkItems}
        />
      </div>
    </>
  );
}

// ────────────────────────────────────────────────
// SSR (Subdomain based)
// ────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const host = (req.headers.host || "").toLowerCase();
    const cleanHost = host.split(":")[0]; // remove port

    const MAIN_DOMAINS = [
      "taxisafar.com",
      "www.taxisafar.com",
      "taxisafar.local",
      "www.taxisafar.local",
    ];

    // ✅ MAIN WEBSITE
    if (MAIN_DOMAINS.includes(cleanHost)) {
      return {
        props: {
          isDriverWebsite: false,
          driverId: null,
          themeId: null,
          blocked: false,
          blockType: null,
          reason: null,
        },
      };
    }

    // ✅ DRIVER DOMAIN (PROD + LOCAL)
    const isTaxiheroDomain =
      cleanHost.endsWith(".taxihero.in") ||
      cleanHost.endsWith(".taxihero.local");

    if (!isTaxiheroDomain) {
      return { notFound: true };
    }

    // Extract subdomain
    const subdomain = cleanHost
      .replace(".taxihero.in", "")
      .replace(".taxihero.local", "");

    // ignore www or root
    if (!subdomain || subdomain === "www") {
      return {
        props: {
          isDriverWebsite: false,
          driverId: null,
          themeId: null,
          blocked: false,
          blockType: null,
          reason: null,
        },
      };
    }

    // Fetch driver website details
    const res = await fetch(
      `https://www.driverwebiste.taxisafar.com/api/website/detail/${subdomain}`,
    );

    if (!res.ok) return { notFound: true };

    const json = await res.json();
    if (!json?.success || !json?.data) return { notFound: true };

    const website = json.data;

    const driverId = website?.driverId || null;
    const themeId = website?.themeId?.themeId || null;

    if (!driverId || !themeId) return { notFound: true };

    // ✅ checks
    const paidTill = website?.paidTill ? new Date(website.paidTill) : null;
    const now = new Date();

    const isExpired = !paidTill || paidTill.getTime() < now.getTime();
    const isPaid = website?.subscription?.status === "paid";
    const isLive = website?.isLive === true;

    // Priority 1: Live check
    if (!isLive) {
      return {
        props: {
          isDriverWebsite: true,
          driverId,
          themeId,
          blocked: true,
          blockType: "not_live",
          reason: "This website is currently not live.",
        },
      };
    }

    // Priority 2: Payment check
    if (!isPaid) {
      return {
        props: {
          isDriverWebsite: true,
          driverId,
          themeId,
          blocked: true,
          blockType: "payment_failed",
          reason: "Payment verification pending.",
        },
      };
    }

    // Priority 3: Expiry check
    if (isExpired) {
      return {
        props: {
          isDriverWebsite: true,
          driverId,
          themeId,
          blocked: true,
          blockType: "expired",
          reason: `Subscription expired on ${paidTill?.toLocaleDateString()}. Please renew.`,
        },
      };
    }

    // ✅ All checks passed
    return {
      props: {
        isDriverWebsite: true,
        driverId,
        themeId,
        blocked: false,
        blockType: null,
        reason: null,
      },
    };
  } catch (err) {
    console.error("Index SSR error:", err);
    return { notFound: true };
  }
};
