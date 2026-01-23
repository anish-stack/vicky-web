import React, { useState } from 'react';
import parse from 'html-react-parser';

interface ServiceSectionOneProps {
    serviceData: any
    title: string
    subTitle: string
    description: string
}

const ServiceSectionOne: React.FC<ServiceSectionOneProps> = ({
    serviceData,
    title,
    subTitle,
    description,
}) => {

    const [activeIndex, setActiveIndex] = useState(0);


    return (
        <>
            <section className="service-section-six">
                <div className="anim-icons">
                    <span className="icon icon-lines-3-bottom bounce-x"></span>
                </div>
                <div className="auto-container">
                    <div className="sec-title light">
                        <div className="row align-items-end">
                            <div className="col-lg-7">
                                <span className="sub-title line-style">{parse(title)}</span>
                                <h2>
                                    {parse(subTitle)}
                                </h2>
                            </div>
                            <div className="col-lg-5">
                                <div className="text">
                                    {description}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="outer-box col-lg-12">
                            <ul className="service-block-six">
                                {serviceData.map((service: any, index: any) => (
                                    <li
                                        key={index}
                                        className={`inner-box ${activeIndex === index ? "active" : ""}`}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <div className="content">
                                            <div className="title-box">
                                                <h4 className="name">
                                                    <a href={service.link}>{service.title}</a>
                                                </h4>
                                                <div className="text">{service.description}</div>
                                            </div>
                                            <div className="info-box">
                                                <div className="share-icon">
                                                    <i className="icon fa-sharp fa-regular fa-arrow-right"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="image-box">
                                            <figure className="image mb-0">
                                                <img src={service.imageUrl} alt={service.title} />
                                            </figure>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>

    );
};

export default ServiceSectionOne;
