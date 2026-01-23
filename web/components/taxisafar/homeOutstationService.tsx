import React, { useState } from 'react';
import parse from 'html-react-parser';
import ServiceCardOne from '../cardComponents/ServiceCardOne';
import { Col, Container, Row } from 'react-bootstrap';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import Link from 'next/link';

interface HomeOutstationServiceProps {
    title: string;
    outstationServices: any;
    OutstationslidesData: any;
    buttonName: string
    handleOutstationTaxi?: any
}

const HomeOutstationService: React.FC<HomeOutstationServiceProps> = ({
    title,
    outstationServices,
    OutstationslidesData,
    buttonName,
    handleOutstationTaxi
}) => {
      const [activeId, setActiveId] = useState(1) as any;
    
    return (
        <div className="taxisafar-section">
        <Container>
          <div className="taxisafar-outstation-services pt-lg-4 pt-md-0 pt-sm-0 pt-0">
            <Row>
              <Col lg={6}>
                <h3 className="taxisafar-title">
                  {parse(title)}
                </h3>

                <div className="outstation-service-list mt-4">
                  {outstationServices.map((service: any, index: any) => (
                    <div
                      key={index}
                      className={`outstation-service-item mt-3 ${activeId == service.id ? "active" : ""}`}
                      onClick={() => {
                        if (activeId === service.id) {
                          setActiveId(null);
                        } else {
                          setActiveId(service.id);
                        }
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="number me-3">
                          <p className="mb-0">{service.number}</p>
                        </div>
                        <div>
                          <p className="mb-0 title">{service.title}</p>
                        </div>
                        <div className="dropdown-icon ms-auto">
                          {activeId == service.id ?
                            <img src="/images/icons/up.png" width="28" height="28" alt="Dropdown" />
                            :
                            <img src="/images/icons/down.png" width="28" height="28" alt="Dropdown" />
                          }
                        </div>
                      </div>

                      {activeId == service.id && (
                        <>
                          <div className="border my-3"></div>

                          <div className="description">
                            <p className="mb-0">{service.description}</p>
                          </div>
                        </>
                      )}

                    </div>
                  ))}

                </div>

                <div className="mt-4">
                  <button className="taxisafar-theme-button" onClick={handleOutstationTaxi}>
                    {buttonName} <i className="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </Col>

              <Col lg={6} className="position-relative">
                <div className="route-image">
                  <img src="/images/icons/route.png" />
                </div>
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={10}
                  slidesPerView={1}
                  loop={true}
                  autoplay={{ delay: 5000 }}
                  pagination={{ clickable: true }}
                >
                  {OutstationslidesData.map((slide: any, index: any) => (
                    <SwiperSlide className="pb-5" key={index}>
                      <div className="d-flex justify-content-end position-relative">
                        <div className="image d-flex justify-content-center align-items-center" style={{ backgroundImage: `url(${slide.imageUrl})` }}>
                          <Link href={slide.videoUrl} target="_blank" className="play-button d-flex justify-content-center align-items-center">
                            <i className="fa-solid fa-play ms-1"></i>
                          </Link>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Col>
            </Row>
          </div>
        </Container>

      </div>
    );
};

export default HomeOutstationService;
