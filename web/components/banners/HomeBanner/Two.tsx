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

const CONTACT_NUMBER = "9412222722";

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

                            <div className="d-flex gap-2 mt-3 vickycab-support-row">
                                <a
                                    href={`tel:${CONTACT_NUMBER}`}
                                    className="d-flex justify-content-center align-items-center vickycab-support-btn vickycab-call-btn"
                                >
                                    <img
                                        src="/images/icons/phone.png"
                                        width="24"
                                        height="24"
                                        className="me-2"
                                    />
                                    Call Now. 941 2222 7222
                                </a>

                                <a
                                    href={`https://wa.me/91${CONTACT_NUMBER}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex justify-content-center align-items-center vickycab-support-btn vickycab-whatsapp-btn"
                                    aria-label="Chat on WhatsApp"
                                >
                                    <img
                                        src="/images/icons/whatsapp.png"
                                        width="24"
                                        height="24"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           
            <div className="container tablet-page-background py-0">
                <div className="row mobile-page-background" style={{ backgroundImage: `url(${imageURL})` }}></div>
            </div>

            <style jsx>{`
                .vickycab-support-row {
                    width: 60%;
                    flex-wrap: nowrap;
                }

                .vickycab-support-btn {
                    height: 48px;
                    border-radius: 8px;
                    font-size:16px;
                    font-weight: 600;
                    background: #fff;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .vickycab-call-btn {
                    flex: 1;
                    min-width: 0;
                    border: 1px solid #e2231a;
                    color: #e2231a;
                }

                .vickycab-whatsapp-btn {
                    flex-shrink: 0;
                    width: 60px;
                    border: 1px solid #dddddd;
                    color: #25d366;
                }

                @media (max-width: 576px) {
                    .vickycab-call-btn {
                        font-size: 18px;
                    }
    .vickycab-support-row {
                    width: 100%;
                    flex-wrap: nowrap;
                }
                    .vickycab-whatsapp-btn {
                        width: 48px;
                    }
                }
            `}</style>
        </section>
    );
};

export default BannerSectionTwo;