import React from 'react';
import Link from 'next/link';

interface HomeAboutUsSectionTwoProps {
 title: string
 features: any
 imageURL: string
 buttonName: string
}

const HomeAboutUsSectionTwo: React.FC<HomeAboutUsSectionTwoProps> = ({
 title,
 features,
 imageURL,
 buttonName
}) => {
    
    return (
        <div className='vicky-cabs'>
            <div className="row position-relative hidden-lg-down">
                <div className="col-lg-6 padding-below-booking-panel"></div>
                <div className="col-lg-6 yellow-right-border"></div>
            </div>
            <div className="row position-relative">
                <div className="col-xl-6 col-lg-6 background-grey img-frame hidden-lg-down">
                    <img
                        data-src={imageURL}
                        alt="outstation taxi"
                        className="img-rounded lazy"
                        style={{ objectPosition: "20%" }}
                        src={imageURL}
                    />
                </div>

                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 bg-white img-frame yellow-right-border">
                    <h2>{title}</h2>
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
                        className="btn btn-book-cab"
                    >
                        {buttonName}
                    </button>
                </div>

                <div className="col-md-12 col-sm-12 col-12 hidden-lg-up">
                    <img
                        data-src={imageURL}
                        alt="outstation taxi"
                        className="img-mobile lazy"
                        style={{ objectPosition: "20%" }}
                        src={imageURL}
                    />
                </div>
            </div>
        </div>


    );
};

export default HomeAboutUsSectionTwo;
