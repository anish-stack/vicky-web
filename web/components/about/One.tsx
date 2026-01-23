import React from 'react';
import Link from 'next/link';

interface HomeAboutUsSectionOneProps {
    title: string;
    subtitle: string;
    blockquote: string;
    description: string;
    features: any;
    videoUrl: string;
    videoImageSrc: string;
    mainImageSrc: string;
    sideImgOneSrc: string;
    sideImgTwoSrc: string;
    buttonName: string;
    buttonLink: string;
    className: string
}

const HomeAboutUsSectionOne: React.FC<HomeAboutUsSectionOneProps> = ({
    title,
    subtitle,
    blockquote,
    description,
    features,
    videoUrl,
    videoImageSrc,
    mainImageSrc,
    sideImgOneSrc,
    sideImgTwoSrc,
    buttonName,
    buttonLink,
    className
}) => {
    return (
        <section className={`about-section ${className}`}>
            <div className="bg bg-image"></div>
            <div className="auto-container">
                <div className="row">
                    <div className="content-column col-lg-6 col-md-12 col-sm-12 order-lg-2" data-aos="fade-left">
                        <div className="inner-column">
                            <div className="sec-title">
                                <span className="sub-title">{subtitle}</span>
                                <h2>{title}</h2>
                                <div className="text">{description}</div>
                            </div>
                            <blockquote className="blockquote-style-two">
                                {blockquote}
                            </blockquote>
                            <div className="bottom-box">
                                <div className="features-outer">

                                    {features?.map((data: any, index: any) =>
                                        <div className="feature-block" key={index}>
                                            <i className={`icon ${data.iconClass}`}></i> {data?.text}
                                        </div>
                                    )}
                                    <Link href={buttonLink} className="theme-btn btn-style-one">
                                        <span className="btn-title">{buttonName}</span>
                                    </Link>
                                </div>

                                <div className="video-box aos-init aos-animate" data-aos="fade-upp">
                                    <figure className="image">
                                        <img src={videoImageSrc} alt="Video Thumbnail" />
                                    </figure>
                                    <a
                                        href={videoUrl}
                                        className="play-btn play-now"
                                        data-fancybox=""
                                        data-caption=""
                                    >
                                        <i className="icon-triangle fas fa-play"></i>
                                        <span className="ripple"></span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="image-column col-lg-6 col-md-12 col-sm-12">
                        <div className="inner-column">
                            <figure className="image tm-gsap-img-parallax overflow-hidden">
                                <img src={mainImageSrc} alt="Main Image" />
                            </figure>
                            <figure className="image-2">
                                <img src={sideImgOneSrc} alt="Side Image 1" />
                            </figure>
                            <figure className="image-3 tm-gsap-img-parallax overflow-hidden">
                                <img src={sideImgTwoSrc} alt="Side Image 2" />
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeAboutUsSectionOne;
