import React, { useState } from 'react';
import parse from 'html-react-parser';
import ServiceCardOne from '../cardComponents/ServiceCardOne';
import { Col, Container, Row } from 'react-bootstrap';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import Link from 'next/link';

interface FAQsProps {
    title: string;
    outstationServices: any;
}

const FAQs: React.FC<FAQsProps> = ({
    title,
    outstationServices,
}) => {
    const [activeId, setActiveId] = useState(1) as any;

    return (
        <div className="taxisafar-section">
            <Container>
                <div className="taxisafar-outstation-services pt-md-0 pt-sm-0 pt-0">
                    <Row>
                        <Col lg={12}>
                            {title.length > 0 && (
                                <h3 className="taxisafar-title">
                                    {parse(title)}
                                </h3>
                            )}


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
                                            <div className='taxisafar-number'>
                                                <div className="number me-3">
                                                    <p className="mb-0">{service.number}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="mb-0 title">{service.question}</p>
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
                                                    <p className="mb-0">{service.answer}</p>
                                                </div>
                                            </>
                                        )}

                                    </div>
                                ))}

                            </div>


                        </Col>

                    </Row>
                </div>
            </Container>

        </div>
    );
};

export default FAQs;
