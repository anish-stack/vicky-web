import React from 'react';
import parse from 'html-react-parser';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import TestimonialCardOne from '../cardComponents/TestimonialCardOne';

interface TestimonialSectionOneProps {
  title: string;
  testimonials: any;
  imageURL: string;
}

const TestimonialSectionOne: React.FC<TestimonialSectionOneProps> = ({
    title,
    testimonials,
    imageURL
}) => {
  return (
    <section className="testimonial-section-three">
        <div className="bg bg-image"></div>
        <div className="image-man" style={{backgroundImage: `url(${imageURL})`}}></div>
        <div className="container pt-0 pb-0">
          <div className="row justify-content-xl-end">
            <div className="col-xl-7">
              <div className="sec-title">
                <h2 className="letters-slide-up text-split">{parse(title)}</h2>
              </div>
              <div className="testimonial-carousel owl-carousel owl-theme default-dots-two">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={50}
                  slidesPerView={1}
                  loop={true}
                  autoplay={{ delay: 5000 }}
                  pagination={{ clickable: true }}
                >
                  {testimonials.map((testimonial: any, index: any) => (
                    <SwiperSlide className="testimonial-block-three pb-4" key={index}>
                      <TestimonialCardOne
                        text={testimonial.text}
                        image={testimonial.image}
                        author={testimonial.author}
                        designation={testimonial.designation}
                        rating={testimonial.rating}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default TestimonialSectionOne;
