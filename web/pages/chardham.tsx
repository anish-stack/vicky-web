// import { Inter } from "next/font/google";
// import Link from "next/link";
// import "swiper/swiper-bundle.css";
// import HomeBannerSectionOne from "../components/banners/HomeBanner/One";
// import HomeAboutUsSectionOne from "../components/about/One";
// import HomeServiceSectionTwo from "../components/services/Two";
// import PricingSectionOne from "../components/priceSection/One";
// import TestimonialSectionOne from "../components/testimonials/One";
// import FaqSectionOne from "../components/FAQ/One";
// import BookingForm from "@/components/form/One";
// import { useEffect } from "react";
// import axios from 'axios';
// import HomeAboutUsSectionTwo from "@/components/about/Two";
// import HomeAboutUsSectionThree from "@/components/about/Three";
import BannerSectionTwo from "@/components/banners/HomeBanner/Two";
import HomeDestination from "@/components/taxisafar/homeDestination";
import HomeAbout from "@/components/taxisafar/homeAbout";
import HomeOutstationService from "@/components/taxisafar/homeOutstationService";
import HomeService from "@/components/taxisafar/homeService";
import HomeCustomerReview from "@/components/taxisafar/homeCustomerReview";
import HomeJoinNetwork from "@/components/taxisafar/homeJoinNetwork";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const outstationServices = [
    {
      id: 1,
      number: "01",
      title: "Which destinations are included in the Char Dham Yatra?",
      description:
        "The Char Dham Yatra includes Yamunotri, Gangotri, Kedarnath, Badrinath, along with Haridwar and Rishikesh. Most journeys begin from Delhi, Haridwar, or Rishikesh.",
    },
    {
      id: 2,
      number: "02",
      title: "Can I book a separate package for Ek Dham or Do Dham Yatra?",
      description:
        "Yes, on the Taxi Safar website, you can book Ek Dham, Do Dham, or Char Dham Yatra packages as per your convenience.",
    },
    {
      id: 3,
      number: "03",
      title: "Which types of vehicles are available for the yatra?",
      description:
        "We provide various vehicles like WagonR, Swift, Dzire, Ertiga, SUV, Innova Crysta, and Tempo Traveller for the Yatra.",
    },
    {
      id: 4,
      number: "04",
      title: "Will I receive driver and vehicle details before the journey?",
      description:
        "Yes, once your booking is confirmed, driver and vehicle details will be available in the 'My Trips' section of your profile.",
    },
    {
      id: 5,
      number: "05",
      title: "What is included in the charges shown on the Taxi Safar website?",
      description:
        "The displayed charges include toll tax, state tax, driver charges, driver's accommodation, and meals. Parking charges are excluded and payable separately.",
    },
    {
      id: 6,
      number: "06",
      title: "Is support available in case of any issue during the journey?",
      description:
        "Yes, you can visit the 'Help Section' on our website for assistance. Our team is available to help you anytime during the booking or journey.",
    },
  ];

  const destinations = [
    {
      imgSrc: "/images/destinations/kedarnath.png",
      title: "Yamunotri, Gangotri, Kedarnath, and Badrinath Char Dham Yatra",
      tripsDays: "4 Dham Yatra  | Min 10-12 Days",
    },
    {
      imgSrc: "/images/destinations/kedarnath_badrinath.png",
      title: "Kedarnath - Badrinath Yatra",
      tripsDays: "2 Dham Yatra  | Min 6-7 Days",
    },
    {
      imgSrc: "/images/destinations/gangotri.png",
      title: "Gangotri Dham Yatra",
      tripsDays: "1 Dham Yatra  | Min 3-4 Days",
    },
    {
      imgSrc: "/images/destinations/kedarnath.png",
      title: "Kedarnath Dham Yatra",
      tripsDays: "1 Dham Yatra  | Min 4-5 Days",
    },
  ];

  const OutstationslidesData = [
    {
      imageUrl: "/images/resource/dham-outstation.png",
      videoUrl: "https://youtu.be/18cjF9f5fT0",
    },
    {
      imageUrl: "/images/resource/dham-outstation.png",
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
        pathname: "/chardham",
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

  return (
    <>
      <Head>
        <title>
          Taxi Safar – India’s Trusted Taxi Service | Char Dham Yatra, One Way /
          Round Trip & Hotels Booking{" "}
        </title>
        <meta
          name="description"
          content="Pan-India cab service for One Way, Round Trip & Pilgrimage Tours. Explore Char Dham Yatra taxi packages & hotel booking at Taxi Safar. Trusted by 10,000+ travelers."
        />
      </Head>

      <div>
        <BannerSectionTwo
          imageURL="/images/banner/dham-banner.png"
          heading="Char Dham Yatra Taxi Services"
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
          imageURL="/images/resource/dham-about.png"
          handleBookTaxi={handleBookTaxi}
        />

        <HomeOutstationService
          title="Char Dham Yatra FAQ"
          outstationServices={outstationServices}
          OutstationslidesData={OutstationslidesData}
          buttonName="Book A Char Dham Yatra"
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
          reviewOneImg="/images/reviews/dham-review-one.png"
          reviewTwoImg="/images/reviews/dham-review-two.jpg"
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
