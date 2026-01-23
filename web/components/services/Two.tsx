import React from 'react';
import parse from 'html-react-parser';
import ServiceCardOne from '../cardComponents/ServiceCardOne';

interface ServiceSectionTwoProps {
  title: string;
  subtitle: string;
  services: any
}

const ServiceSectionTwo: React.FC<ServiceSectionTwoProps> = ({
    title,
    subtitle,
    services
}) => {
  return (
    <section className="service-section-five">
        <div className="bg bg-image"></div>
        <div className="auto-container">
          <div className="sec-title text-center">
            <span className="sub-title">{title}</span>
            <h2 className="letters-slide-up text-split">
              {parse(subtitle)}
            </h2>
          </div>
          <div className="row" data-aos="fade-left">
            {services?.map((service: any, index: any) => (
              <div className="col-lg-4 col-sm-6" key={index}>
                <ServiceCardOne
                  imgSrc={service.imgSrc}
                  link={service.link}
                  title={service.title}
                  description={service.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default ServiceSectionTwo;
