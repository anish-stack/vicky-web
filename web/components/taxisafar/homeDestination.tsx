import React from 'react';
import parse from 'html-react-parser';
import ServiceCardOne from '../cardComponents/ServiceCardOne';
import { Container } from 'react-bootstrap';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

interface HomeDestinationProps {
    title: string;
    description: string;
    destinations: any
}

const HomeDestination: React.FC<HomeDestinationProps> = ({
    title,
    description,
    destinations
}) => {
    return (
        <Container>
            <div className="taxisafar-section">
                <div className="taxisafar-destination">
                    <h3 className="taxisafar-title text-center">
                        {parse(title)}
                    </h3>

                    <p className="taxisafar-description text-center mt-3">
                        {parse(description)}
                    </p>

                    <div className="position-relative">

                        <button className="position-absolute swiper-prev-button start-0 top-50 translate-middle-y z-3 ms-3" id="prevDestinationBtn">
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <button className="position-absolute swiper-next-button end-0 top-50 translate-middle-y z-3 me-3" id="nextDestinationBtn">
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                        <Swiper
                            modules={[Pagination, Autoplay, Navigation]}
                            spaceBetween={20}
                            slidesPerView={3}
                            navigation={{
                                prevEl: "#prevDestinationBtn",
                                nextEl: "#nextDestinationBtn",
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
                        >

                            {destinations.map((destination: any, index: any) => (
                                <SwiperSlide key={index} >
                                    <div className="taxisafar-destination-card">
                                        <div>
                                            <img src={destination.imgSrc} alt={destination.title} />
                                        </div>
                                        <div className="info">
                                            <p className="title">{destination.title}</p>
                                            <p className="trips-days">{destination.tripsDays}</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                </div>
            </div>
        </Container>
    );
};

export default HomeDestination;
