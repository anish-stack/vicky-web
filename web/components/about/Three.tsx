import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

interface HomeAboutUsSectionThreeProps {
    title: string
    features: any
    buttonName: string
    videoUrls: any
}

const HomeAboutUsSectionThree: React.FC<HomeAboutUsSectionThreeProps> = ({
    title,
    features,
    buttonName,
    videoUrls
}) => {

    return (
        <div className="row vicky-cabs position-relative">
            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 img-frame yellow-left-border">
                {/* <h2>{title}</h2> */}

                <div className="sec-title">
                    {/* <span className="sub-title">{subtitle}</span> */}
                    <h2>{title}</h2>
                    {/* <div className="text">{description}</div> */}
                </div>

                {features.map((feature: any, index: any) => (
                    <div key={index}>
                        <div className="text-subtitle">{feature.title}</div>
                        <p className="text-left text-small">
                            {feature.details.map((detail: any, detailIndex: any) => (
                                <span key={detailIndex}>
                                    {detail}
                                    {detailIndex < feature.details.length - 1 && (
                                        <span className="mx-2">
                                            <i className="fa fa-circle fa-circle-small"></i>
                                        </span>
                                    )}
                                </span>
                            ))}
                        </p>
                    </div>
                ))}

                <button
                    className="theme-btn btn-style-one border-0"
                >
                    {buttonName}
                </button>

                {/* <Link href={"#"} className="theme-btn btn-style-one">
                    <span className="btn-title">{buttonName}</span>
                </Link> */}
            </div>
            <div className="col-xl-6 col-lg-6 img-frame hidden-lg-down ">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    className='pb-4'
                >
                    {videoUrls.map((url: any, index: any) => (
                        <SwiperSlide key={index}>
                            <iframe
                                className="img-rounded lazy"
                                style={{ objectPosition: "20%" }}
                                src={url}
                                title={`YouTube video player ${index + 1}`}
                                frameBorder={0}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="col-md-12 col-sm-12 col-12 hidden-lg-up">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={10}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    className='pb-4'
                >
                    {videoUrls.map((url: any, index: any) => (
                        <SwiperSlide key={index}>
                            <iframe
                                className="img-mobile lazy"
                                style={{ objectPosition: "20%" }}
                                src={url}
                                title={`YouTube video player ${index + 1}`}
                                frameBorder={0}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </SwiperSlide>
                    ))}
                </Swiper>
                {/* <iframe className="img-mobile lazy" style={{ objectPosition: "20%" }} src="https://www.youtube.com/embed/GZgQZLckVmI?si=sNHGvODvQLuuthgo&rel=0&controls=0" title="YouTube video player" frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe> */}
            </div>
        </div>
    );
};

export default HomeAboutUsSectionThree;
