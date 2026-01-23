// import { Inter } from "next/font/google";
// import Link from "next/link";
// import "swiper/swiper-bundle.css";
// import HomeBannerSectionOne from "../components/banners/HomeBanner/One";
// import HomeAboutUsSectionFour from "../components/about/Four";
// import HomeServiceSectionTwo from "../components/services/Two";
// import PricingSectionOne from "../components/priceSection/One";
// import TestimonialSectionOne from "../components/testimonials/One";
// import FaqSectionOne from "../components/FAQ/One";
// import BookingForm from "@/components/form/One";
import { useEffect } from "react";
// import axios from 'axios';
import BannerSectionTwo from "@/components/banners/HomeBanner/Two";
// import HomeAboutUsSectionTwo from "@/components/about/Two";
// import HomeAboutUsSectionThree from "@/components/about/Three";
// import { Col, Row, Container } from "react-bootstrap";

// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination, Autoplay, Navigation } from "swiper/modules";
// import "swiper/swiper-bundle.css";
import HomeDestination from "@/components/taxisafar/homeDestination";
import HomeAbout from "@/components/taxisafar/homeAbout";
import HomeOutstationService from "@/components/taxisafar/homeOutstationService";
import HomeService from "@/components/taxisafar/homeService";
import HomeJoinNetwork from "@/components/taxisafar/homeJoinNetwork";
import HomeCustomerReview from "@/components/taxisafar/homeCustomerReview";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const outstationServicesold = [
    {
      id: 1,
      number: "01",
      title: "Transport Services",
      description:
        "No Unexpected Shortages  |  Vast Fleet of Vehicles  |  Cabs Available Year-Round, for Every Route",
    },
    {
      id: 2,
      number: "02",
      title: "Single Journey Fare",
      description:
        "No Return Charges  | No Excessive Pricing  |  No Hidden Fees | Low Initial Deposit",
    },
    {
      id: 3,
      number: "03",
      title: "Pet-Friendly Ride",
      description:
        "Travel with Your Furry Companions | Pets Welcome: Dogs, Cats, Birds",
    },
    {
      id: 4,
      number: "04",
      title: "Our Offerings",
      description:
        "Inter-City Travel | Local Car Hire Services | Airport Pickup and Drop-Off | Long-Distance | Ride Bookings",
    },
    {
      id: 5,
      number: "05",
      title: "Guaranteed Luggage Room",
      description:
        "Ample Storage in Trunk or Carrier  | No Concerns with CNG Vehicle Storage",
    },
  ];

  const outstationServices = [
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

  const destinations = [
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

  const OutstationslidesData = [
    {
      imageUrl: "/images/resource/outstation.jpg",
      videoUrl: "https://youtu.be/18cjF9f5fT0",
    },
    {
      imageUrl: "/images/resource/outstation.jpg",
      videoUrl: "https://youtu.be/18cjF9f5fT0",
    },
  ];

  const latestServices = [
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

  const networkItems = [
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

  const testimonials = [
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

  const router = useRouter();

  const handleBookTaxi = () => {
    router
      .push({
        pathname: "/",
        // query: { taxisafar_category: 'outstation', taxisafar_triptype: 'oneWay' },
        hash: "navigate-to-top",
      })
      .then(() => {
        setTimeout(() => {
          const el = document.getElementById("navigate-to-top");
          if (el) {
            const top =
              el.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 100);
      });
  };

  const handleOutstationTaxi = () => {
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
        setTimeout(() => {
          const el = document.getElementById("navigate-to-top");
          if (el) {
            const top =
              el.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 100);
      });
  };

  const useHashScrollWithOffset = (offset = 100) => {
    const router = useRouter();

    useEffect(() => {
      const hash = window.location.hash;

      if (hash) {
        window.scrollTo(0, 0);
      }

      const handleScrollWithOffset = () => {
        if (window.location.hash) {
          const id = window.location.hash.replace("#", "");
          const el = document.getElementById(id);
          if (el) {
            const top =
              el.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }
      };

      setTimeout(() => {
        handleScrollWithOffset();
      }, 50);

      router.events.on("hashChangeComplete", handleScrollWithOffset);

      return () => {
        router.events.off("hashChangeComplete", handleScrollWithOffset);
      };
    }, [router, offset]);
  };

  useHashScrollWithOffset(100);

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
          OutstationslidesData={OutstationslidesData}
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
