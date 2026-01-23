import React from 'react';
import parse from 'html-react-parser';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import PricingCardOne from '../cardComponents/PricingCardOne';

interface PricingSectionOneProps {
  title: string;
  subtitle: string;
  pricingData: any
}

const PricingSectionOne: React.FC<PricingSectionOneProps> = ({
    title,
    subtitle,
    pricingData
}) => {
  return (
    <section className="pricing-section-four">
    <div className="auto-container">
      <div className="sec-title text-center">
        <span className="sub-title">{parse(title)}</span>
        <h2 className="letters-slide-up text-split">{parse(subtitle)}</h2>
      </div>
      <div className="outer-box" data-aos="fade-left">
        <div className="pricing-carousel owl-carousel owl-theme default-dots">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
          >
            {pricingData.map((item: any, index: any) => (
              <SwiperSlide className="pricing-block-four" key={index}>
                <PricingCardOne
                  img={item.img}
                  car={item.car}
                  city={item.city}
                  initialChange={item.initialChange}
                  perMile={item.perMile}
                  traffic={item.traffic}
                  passengers={item.passengers}
                  link={item.link}
                  buttonName={'Book a Taxi'}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  </section>
  );
};

export default PricingSectionOne;
