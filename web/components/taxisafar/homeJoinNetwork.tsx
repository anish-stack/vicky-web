import React, { useState } from "react";
import parse from "html-react-parser";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

interface HomeJoinNetworkProps {
  title: string;
  subtitle: string;
  networkItems: any;
}

const HomeJoinNetwork: React.FC<HomeJoinNetworkProps> = ({
  title,
  subtitle,
  networkItems,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="taxisafar-section">
      <Container>
        <h3 className="taxisafar-main-title text-center">{parse(title)}</h3>
        <h3 className="taxisafar-title text-center">{parse(subtitle)}</h3>

        {/* Mobile view: buttons instead of swiper */}
        <div className="d-block d-md-none mt-4">
          <div className="d-flex justify-content-center gap-2">
            {networkItems.map((item: any, index: number) => (
              <button
                key={index}
                // className={`btn ${
                //   activeIndex === index
                //     ? "theme-btn btn-style-two hover-light"
                //     : "transparent"
                // }`}
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
            <img
              src={networkItems[activeIndex].imgSrc}
              alt={networkItems[activeIndex].title}
              loading="lazy"
            />
            <div className="info d-flex flex-column flex-grow-1 mt-2">
              <h3 className="title">{networkItems[activeIndex].title}</h3>
              <p
                className="mb-3 description"
                dangerouslySetInnerHTML={{
                  __html: networkItems[activeIndex].description,
                }}
              ></p>
              <a href={networkItems[activeIndex].link || "#"}>
                <button className="taxisafar-theme-button">
                  Get Started <i className="fa-regular fa-arrow-right"></i>
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* <Row className="mt-4">
                    {networkItems.map((item: any, index: any) => (
                        <Col lg={4} md={6} className='mt-3' key={index}>
                            <div className="our-network-card d-flex flex-column h-100">
                                <div>
                                    <img src={item.imgSrc} alt={item.title} />
                                </div>

                                <div className="info d-flex flex-column flex-grow-1">
                                    <h3 className="title">{item.title}</h3>
                                    <p className="mb-3 description">{item.description}</p>

                                    <div className="mt-auto">
                                        <div className="button d-flex justify-content-center align-items-center">
                                            <i className="fa-regular fa-arrow-right"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row> */}

        <div className="d-none d-md-block position-relative join-our-network mt-5">
          <button
            className="position-absolute swiper-prev-button start-0 top-50 translate-middle-y z-3 ms-3"
            id="prevBtn"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button
            className="position-absolute swiper-next-button end-0 top-50 translate-middle-y z-3 me-3"
            id="nextBtn"
          >
            <i className="fa-solid fa-arrow-right"></i>
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
            {networkItems.map((destination: any, index: any) => (
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
                    {/* <div className="button d-flex justify-content-center align-items-center">
                                                <i className="fa-regular fa-arrow-right"></i>
                                            </div> */}

                    <a href={`${destination.link ? destination.link : "#"} `}>
                      <button className="taxisafar-theme-button">
                        Get Started{" "}
                        <i className="fa-regular fa-arrow-right"></i>
                      </button>
                    </a>
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
