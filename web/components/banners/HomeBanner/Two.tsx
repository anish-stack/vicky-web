import React from 'react';
// import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";
import BookingFormOnBanner from '@/components/form/googlemapBookingFormOnBannerTwo';

interface BannerSectionTwoProps {
    imageURL: string
    heading: string
}

const BannerSectionTwo: React.FC<BannerSectionTwoProps> = ({
    imageURL,
    heading
}) => {
    return (
        <section className='vicky-cab-homebanner' id="navigate-to-top">
            <div className="page-header page-background d-flex justify-content-center align-items-center" style={{ backgroundImage: `url(${imageURL})` }}>
                <div className="container text-center ">
                    <div className='row d-flex items-align-center'>
                        <div className='col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 vickycab-booking-form'>
                            <BookingFormOnBanner
                                // Title="Online booking"
                                // subTitle="Confirm your booking now!"
                                buttonName="Check Prices"
                                heading={heading}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="container py-0" style={{ position: "relative" }}>
                <div className="text-center carousal-wrapper vicky-feature-block">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        slidesPerView={1}
                        autoplay={{ delay: 3000 }}
                        breakpoints={{
                            640: {
                                slidesPerView: 1,
                            },
                            768: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                        }}
                        className="feature-carousal carousal"
                    >
                        <SwiperSlide>
                            <div className="text-bold">Popular Tour Package</div>
                            <div className="popular-place">
                                Vrindavan
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="text-bold">Popular Tour Package</div>
                            <div className="popular-place">
                                Rishikesh
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="text-bold">Popular Tour Package</div>
                            <div className="popular-place">
                                Haridwar
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div> */}
            <div className="container tablet-page-background py-0">
                <div className="row mobile-page-background" style={{ backgroundImage: `url(${imageURL})` }}></div>
            </div>
        </section>
    );
};

export default BannerSectionTwo;
