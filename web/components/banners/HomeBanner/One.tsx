import React from 'react';
import parse from 'html-react-parser';
import BookingFormOnBanner from '@/components/form/googlemapBookingFormOnBanner';

interface BannerSectionOneProps {
  backgroundImage: string;
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}

const BannerSectionOne: React.FC<BannerSectionOneProps> = ({
  backgroundImage,
  title,
  text,
  buttonText,
  buttonLink,
}) => {
  return (
    <section className="banner-section pt-5 pb-5 d-flex align-items-center justify-content-center">
      <div className="banner-carousel owl-carousel owl-theme">
        <div className="slide-item">
          <div
            className="bg bg-image"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          ></div>
          <div className="auto-container row d-flex">
            <div className="content-box col-lg-5 col-md-12">
              <BookingFormOnBanner
                Title="Online booking"
                subTitle="Confirm your booking now!"
                buttonName="Check Prices"
              />
            </div>
            <div className="content-box banner-info col-lg-7 col-md-12 ps-5 d-flex align-items-center">
              <div className='d-block'>
                <h1 className="title animate-1" style={{ fontSize: "52px" }}>
                  {parse(title)}
                </h1>
                <div className="text d-block animate-2">{parse(text)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSectionOne;
