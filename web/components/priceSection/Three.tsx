import React from 'react';
import parse from 'html-react-parser';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import PricingCardThree from '../cardComponents/PricingCardThree';

interface PricingSectionThreeProps {
  pricingData: any
  departureDate: any
}

const PricingSectionThree: React.FC<PricingSectionThreeProps> = ({
  pricingData,
  departureDate
}) => {
  return (
    <section className="pricing-section-four py-0">
      <div className="container py-0">
        <div className="outer-box" data-aos="fade-left">
          <div className="pricing-carousel owl-carousel owl-theme default-dots">
            <div className='row'>
              {pricingData.map((item: any, index: any) => (
                <div className='col-lg-4 col-md-6 pricing-block-four' key={index}>
                  <PricingCardThree
                    img={item.img}
                    car={item.car}
                    price={item.price}
                    includedKm={item.includedKm}
                    pricePerKm={item.pricePerKm}
                    additional_time_charge={item.additional_time_charge}
                    fuelcharges={item.fuelcharges}
                    drivercharges={item.drivercharges}
                    nightcharges={item.nightcharges}
                    terms={item.terms}
                    link={'#'}
                    buttonName={'Book a Taxi'}
                  />
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSectionThree;
