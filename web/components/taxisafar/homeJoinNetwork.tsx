import React, { useState } from "react";
import parse from "html-react-parser";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

interface HomeJoinNetworkProps {
  title: string;
  subtitle: string;
}

interface NetworkItem {
  imgSrc: string;
  title: string;
  description: string;
  serviceType: string;
}

// Google Play search link for the Taxi Safar app — swap for the direct app
// page link once you have it (play.google.com/store/apps/details?id=...)
const PLAY_STORE_URL =
  "https://play.google.com/store/search?q=Taxi%20safar&c=apps&hl=en_IN";

// Fixed 3-card list — all three drive the same goal: get the Driver App
// installed. No longer sourced from a prop; the content itself now talks
// about the app instead of a generic "Get Started" link per card.
const networkItems: NetworkItem[] = [
  {
    imgSrc: "/images/our-network/driver.jpg",
    title: "Become a Driver — Download the Driver App",
    description:
      "Taxi Safar Driver App mein gadi add karen aur har din intercity booking accept karen.<br/>Taxi Attachment & All Updates ek hi app mein.<br/>(Only For Taxi Owners & Drivers)",
    serviceType: "Taxi Attach",
  },
  {
    imgSrc: "/images/our-network/booking.jpg",
    title: "Manage Bookings — Download the Driver App",
    description:
      "Apne city ya area ki bookings manage karne ke liye Taxi Safar Driver App download karen aur seedha app se accept/track karen.",
    serviceType: "Booking Panel",
  },
  {
    imgSrc: "/images/our-network/hotel.jpg",
    title: "Partner Hotels — Download the Driver App",
    description:
      "Hotel guests ke liye ride requests seedha Taxi Safar Driver App par milengi. Download karen aur judiye.",
    serviceType: "Hotel List",
  },
];

// Inline SVG icons — rendered directly, never dependent on an external
// icon-font CDN loading correctly.
const ArrowRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="13 5 20 12 13 19" />
  </svg>
);

const ArrowLeftIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="11 5 4 12 11 19" />
  </svg>
);

// Google Play triangle glyph for the download badge.
const PlayStoreGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="#00d2ff" d="M99.617 8.057c-4.995 4.05-8.017 10.517-8.017 18.977v460.66c0 8.46 3.022 14.927 8.017 18.977l1.049.8L343.3 274.7v-5.33L100.666 7.257z" />
    <path fill="#00f076" d="M423.652 356.988l-81.44-81.44v-4.096l81.472-81.44 1.842.987 96.55 54.86c27.582 15.66 27.582 41.34 0 57.03l-96.55 54.86z" />
    <path fill="#ff3a44" d="M425.494 356l-83.282-83.282L99.617 503.99c8.966 9.485 23.766 10.663 40.427 1.21l285.45-149.2" />
    <path fill="#ffcf00" d="M425.494 190.03L140.044 40.796c-16.66-9.42-31.46-8.276-40.427 1.21l242.595 242.62z" />
  </svg>
);

const PlayStoreBadge = () => (
  <a
    href={PLAY_STORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="taxisafar-playstore-badge d-inline-flex align-items-center"
  >
    <PlayStoreGlyph />
    <span className="ms-2 d-flex flex-column lh-1">
      <span style={{ fontSize: "10px" }}>Download on</span>
      <span style={{ fontSize: "15px", fontWeight: 600 }}>Play Store</span>
    </span>
  </a>
);

const HomeJoinNetwork: React.FC<HomeJoinNetworkProps> = ({
  title,
  subtitle,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = networkItems[activeIndex];

  return (
    <div className="taxisafar-section">
      <Container>
        <h3 className="taxisafar-main-title text-center">{parse(title)}</h3>
        <h3 className="taxisafar-title text-center">{parse(subtitle)}</h3>

        {/* Mobile view: buttons instead of swiper */}
        <div className="d-block d-md-none mt-4">
          <div className="d-flex justify-content-center flex-wrap gap-2">
            {networkItems.map((item, index) => (
              <button
                key={index}
                className="px-3"
                style={{
                  backgroundColor:
                    activeIndex === index ? "#e52710" : "transparent",
                  color: activeIndex === index ? "#fff" : "#e52710",
                  border: `1px solid #e52710`,
                  borderRadius: "4px",
                }}
                onClick={() => setActiveIndex(index)}
              >
                {item.serviceType}
              </button>
            ))}
          </div>

          {/* Show selected item */}
          <div className="our-network-card d-flex flex-column mt-3">
            <img src={active.imgSrc} alt={active.title} loading="lazy" />
            <div className="info d-flex flex-column flex-grow-1 mt-2">
              <h3 className="title">{active.title}</h3>
              <p
                className="mb-3 description"
                dangerouslySetInnerHTML={{ __html: active.description }}
              ></p>
              <PlayStoreBadge />
            </div>
          </div>
        </div>

        <div className="d-none d-md-block position-relative join-our-network mt-5">
          <button
            className="position-absolute swiper-prev-button start-0 top-50 translate-middle-y z-3 ms-3"
            id="prevBtn"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <button
            className="position-absolute swiper-next-button end-0 top-50 translate-middle-y z-3 me-3"
            id="nextBtn"
          >
            <ArrowRightIcon size={18} />
          </button>
          <Swiper
            modules={[Pagination, Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={3}
            navigation={{
              prevEl: "#prevBtn",
              nextEl: "#nextBtn",
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 10 },
              375: { slidesPerView: 1, spaceBetween: 10 },
              425: { slidesPerView: 1, spaceBetween: 10 },
              768: { slidesPerView: 2, spaceBetween: 15 },
              1024: { slidesPerView: 2, spaceBetween: 20 },
              1200: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="mt-4"
            autoHeight={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
          >
            {networkItems.map((destination, index) => (
              <SwiperSlide
                key={index}
                className="our-network-card d-flex flex-column h-100"
              >
                <div>
                  <img
                    src={destination.imgSrc}
                    alt={destination.title}
                    loading="lazy"
                  />
                </div>

                <div className="info d-flex flex-column flex-grow-1">
                  <h3 className="title">{destination.title}</h3>
                  <p
                    className="mb-3 description"
                    dangerouslySetInnerHTML={{
                      __html: destination.description,
                    }}
                  ></p>

                  <div className="mt-auto">
                    <PlayStoreBadge />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </div>
  );
};

export default HomeJoinNetwork;