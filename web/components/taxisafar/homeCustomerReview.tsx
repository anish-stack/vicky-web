import React from 'react';
import parse from 'html-react-parser';
import { Col, Container, Row } from 'react-bootstrap';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

interface HomeCustomerReviewProps {
    title: string;
    subtitle: string;
    description: string;
    satisfactionRate: string;
    experience: string;
    testimonials: any;
    reviewOneImg: string;
    reviewTwoImg: string;
}

const HomeCustomerReview: React.FC<HomeCustomerReviewProps> = ({
    title,
    subtitle,
    description,
    satisfactionRate,
    experience,
    testimonials,
    reviewOneImg,
    reviewTwoImg
}) => {

    return (
        <div className="taxisafar-section">
            <div className="taxisafar-reviews ">
                <Container>
                    <Row className="">
                        <Col lg={6} className="d-flex align-items-center">
                            <div>
                                <h3 className="taxisafar-main-title">
                                    {parse(title)}
                                </h3>
                                <h3 className="taxisafar-title">
                                    {parse(subtitle)}
                                </h3>

                                <p className="taxisafar-description  my-4 me-lg-5">
                                    {parse(description)}
                                </p>

                                <Row>
                                    <Col xs={5}>
                                        <div className="rate-experience">
                                            <h6 className="value mb-0">
                                                {satisfactionRate}<span className="icon">%</span>
                                            </h6>
                                            <p className="title mb-0">
                                                Satisfaction Rate
                                            </p>
                                        </div>
                                    </Col>

                                    <Col xs={5}>
                                        <div className="rate-experience">
                                            <h6 className="value mb-0">
                                                {experience}<span className="icon">+</span>
                                            </h6>
                                            <p className="title mb-0">
                                                Year of Experience
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                        </Col>

                        <Col lg={6} className='lg-mt-0 mt-4'>
                            <Row className="g-4">
                                <Col md={12}>
                                    <div className="position-relative">
                                        <div className="review-buttons">
                                            <button className="position-absolute swiper-prev-button ms-3" id="prevBtnReview">
                                                <i className="fa-solid fa-arrow-left"></i>
                                            </button>
                                            <button className="position-absolute swiper-next-button me-3" id="nextBtnReview">
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </button>
                                        </div>

                                        <Swiper
                                            modules={[Pagination, Autoplay, Navigation]}
                                            spaceBetween={10}
                                            slidesPerView={1}
                                            navigation={{
                                                prevEl: "#prevBtnReview",
                                                nextEl: "#nextBtnReview",
                                            }}
                                        >
                                            {testimonials.map((testimonial: any, index: any) => (
                                                <SwiperSlide key={index}>
                                                    <div className="testimonial d-flex flex-column">
                                                        <div className="rating mb-4">
                                                            {Array.from({ length: testimonial.rating }).map((_: any, i: any) => (
                                                                <i key={i} className="fa-solid fa-star me-1"></i>
                                                            ))}
                                                        </div>
                                                        <p className="description">{testimonial.description}</p>
                                                        <div className="user mt-auto">
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={testimonial.user.image}
                                                                    alt={testimonial.user.name}
                                                                    className="rounded-circle me-3"
                                                                    width="44"
                                                                    height="44"
                                                                />
                                                                <div>
                                                                    <p className="mb-0 name">{testimonial.user.name}</p>
                                                                    <p className="mb-0 designation">{testimonial.user.designation}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>


                                </Col>

                                <Col md={7}>
                                    <img className="image" src={reviewOneImg} />
                                </Col>

                                <Col md={5}>
                                    <img className="image" src={reviewTwoImg} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default HomeCustomerReview;
