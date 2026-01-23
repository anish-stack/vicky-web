import React, { useState } from 'react';
import parse from 'html-react-parser';
import { Col, Container, Row } from 'react-bootstrap';

interface HomeServiceProps {
    title: string;
    subtitle: string;
    latestServices: any;
}

const HomeService: React.FC<HomeServiceProps> = ({
    title,
    subtitle,
    latestServices
}) => {

    return (
        <div className="taxisafar-services">
            <Container>
                <h3 className="taxisafar-main-title text-center">
                    {parse(title)}
                </h3>
                <h3 className="taxisafar-title text-center">
                    {parse(subtitle)}
                </h3>

                <Row className="mt-4">
                    {latestServices.map((service: any, index: any) => (
                        <Col lg={4} md={6} className='mt-3' key={index}>
                            <div className="taxisafar-service-card">
                                <div>
                                    <img src={service.imgSrc} alt={service.title} />
                                </div>
                                <div className="info">
                                    <h5 className="title">{service.title}</h5>
                                    <p className="mb-0 description">{service.description}</p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default HomeService;
