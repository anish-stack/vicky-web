import React from 'react';
import Link from 'next/link';

interface ServiceCardOneProps {
    imgSrc: string;
    link: string;
    title: string;
    description: string;

}

const ServiceCardOne: React.FC<ServiceCardOneProps> = ({
    imgSrc,
    link,
    title,
    description
}) => {
    return (
        <div className="service-block-five">
            <div className="inner-box">
                <div className="image-box">
                    <figure className="image">
                        <img src={imgSrc} alt="Service" />
                    </figure>
                </div>
                <div className="content">
                    <h4 className="title">
                        <Link href={link} className="text-dark text-transform-none text-decoration-none">{title}</Link>
                    </h4>
                    <div className="text">{description}</div>
                </div>
            </div>
        </div>
    );
};

export default ServiceCardOne;
