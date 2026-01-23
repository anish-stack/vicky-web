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

export default function Hotel() {
  const hotelBookingFAQs = [
    {
      id: 1,
      number: "01",
      title: "Can I book a hotel from the Taxi Safar website?",
      description:
        "Yes, you can easily book a hotel for your trip through the Taxi Safar website.",
    },
    {
      id: 2,
      number: "02",
      title: "What is included in the hotel booking?",
      description:
        "Hotel booking includes room charges and applicable taxes. In some cases, breakfast or other amenities may also be included, which will be clearly mentioned on the booking page.",
    },
    {
      id: 3,
      number: "03",
      title: "Can I cancel a hotel booking?",
      description:
        "Yes, cancellation facility is available. The cancellation policy may vary depending on the hotel and the time of booking.",
    },
    {
      id: 4,
      number: "04",
      title:
        "Will the hotel booking details be visible on the website after confirmation?",
      description:
        "Yes, once the hotel booking is confirmed, the details will be visible in the Profile option after logging into the website.",
    },
    {
      id: 5,
      number: "05",
      title: "Is advance payment required while booking a hotel?",
      description:
        "Yes, advance payment is mandatory to confirm the hotel booking.",
    },
    {
      id: 6,
      number: "06",
      title:
        "What should I do if I face any issues during the booking process?",
      description:
        "If you face any kind of issue during the booking process, you can visit the Help Section on the website to get assistance. Our team is always ready to help you.",
    },
  ];

  const destinations = [
    {
      imgSrc: "/images/destinations/new-delhi.png",
      title: "New Delhi",
      tripsDays: "2,919 Properties",
    },
    {
      imgSrc: "/images/destinations/varanasi.png",
      title: "Varanasi",
      tripsDays: "554 properties",
    },
    {
      imgSrc: "/images/destinations/mumbai.png",
      title: "Mumbai",
      tripsDays: "1,652 properties",
    },
    {
      imgSrc: "/images/destinations/new-delhi.png",
      title: "New Delhi",
      tripsDays: "2,919 Properties",
    },
  ];

  const OutstationslidesData = [
    {
      imageUrl: "/images/resource/hotel-outstation.png",
      videoUrl: "https://youtu.be/18cjF9f5fT0",
    },
    {
      imageUrl: "/images/resource/hotel-outstation.png",
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
        "your hotel and connect with travelers. Get started by filling out the form.",
      serviceType: "Hotel List",
    },
  ];

  const testimonials = [
    {
      rating: 5,
      descriListption:
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
        pathname: "/hotel",
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
          Book Outstation Taxi | Delhi to Char Dham Cabs | Hotels & One Way
          Rides – TaxiSafar
        </title>
        <meta
          name="description"
          content="Hire reliable Delhi-based outstation cabs, Char Dham taxi services & hotel stays with TaxiSafar. One-way & round trip options. Safe rides, transparent rates, 24x7 booking."
        />
      </Head>
      <div>
        <BannerSectionTwo
          imageURL="/images/banner/hotel-banner.png"
          heading="All India Hotel Available"
        />

        <HomeDestination
          title="Explore Popular Dham Yatra"
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
          imageURL="/images/resource/hotel-about.jpg"
          handleBookTaxi={handleBookTaxi}
        />

        <HomeOutstationService
          title="Hotel booking related (FAQs)"
          outstationServices={hotelBookingFAQs}
          OutstationslidesData={OutstationslidesData}
          buttonName="Book a Hotel"
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
          reviewOneImg="/images/reviews/hotel-review-one.png"
          reviewTwoImg="/images/reviews/hotel-review-two.png"
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
