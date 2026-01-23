import React from 'react';
import parse from 'html-react-parser';
import { Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';

interface HomeAboutProps {
    title: string;
    subtitle: string;
    description: string;
    highlightDescription: string;
    buttonName: string;
    videoLink: string;
    imageURL: string;
    handleBookTaxi?: any;
}

const HomeAbout: React.FC<HomeAboutProps> = ({
    title,
    subtitle,
    description,
    highlightDescription,
    buttonName,
    videoLink,
    imageURL,
    handleBookTaxi
}) => {
    return (
        <div className="taxisafar-section">
            <Container>
                <div className="taxisafar-about">
                    <Row>
                        <Col lg={6}>
                            <div className="position-relative">
                                <div className="asterisk">
                                    <img src="/images/icons/asterisk.png" width="77" />
                                </div>
                                <div className="image d-flex justify-content-start align-items-end" style={{ backgroundImage: `url(${imageURL})` }}>
                                    <img src="/images/resource/likes.png" height="111" />

                                    <Link href={videoLink} target="_blank" className="play-button d-flex justify-content-center align-items-center ms-3">
                                        <i className="fa-solid fa-play ms-1"></i>
                                    </Link>
                                </div>
                                <div className="pattern">
                                    <img src="/images/pattern/pattern-one.png" />
                                </div>
                            </div>

                        </Col>

                        <Col lg={6} className="d-flex align-items-center">
                            <div>
                                <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                    {parse(title)}
                                </h3>
                                <h3 className="taxisafar-title mt-4">
                                    {parse(subtitle)}
                                </h3>

                                <p className="taxisafar-description mt-4">
                                    {parse(description)}
                                </p>

                                <p className="taxisafar-highlight-description mt-4">
                                    {parse(highlightDescription)}
                                </p>

                                <div className="contact mt-4">
                                    <Row>
                                        <Col xs={6}>
                                            <Row>
                                                <Col xs={2}>
                                                    <div className="icon">
                                                        <img src="/images/icons/calender.png" width="28" height="28" />
                                                    </div>
                                                </Col>

                                                <Col xs={10} className="ps-4 d-flex align-items-center">
                                                    <h5 className="title">Online Booking</h5>
                                                </Col>
                                            </Row>
                                        </Col>

                                        <Col xs={6}>
                                            <Row>
                                                <Col xs={2}>
                                                    <div className="icon">
                                                        <img src="/images/icons/support.png" width="28" height="28" />
                                                    </div>
                                                </Col>

                                                <Col xs={10} className="ps-4 d-flex align-items-center">
                                                    <h5 className="title">24/7 Support</h5>
                                                </Col>
                                            </Row>
                                        </Col>


                                    </Row>

                                </div>

                                <div className="mt-4">
                                    <button className="taxisafar-theme-button" onClick={handleBookTaxi}>
                                        {buttonName} <i className="fa-solid fa-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default HomeAbout;
