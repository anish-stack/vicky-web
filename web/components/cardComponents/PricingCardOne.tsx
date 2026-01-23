import React from 'react';
import Link from 'next/link';

interface PricingCardOneProps {
  img: string;
  car: string;
  city: string;
  initialChange: string;
  perMile: string;
  traffic: string;
  passengers: string;
  link: string;
  buttonName: string;
}

const PricingCardOne: React.FC<PricingCardOneProps> = ({
    img,
    car,
    city,
    initialChange,
    perMile,
    traffic,
    passengers,
    link,
    buttonName,
}) => {
    return (
        <div className="inner-box">
            <div className="image-box">
                <figure className="image"><img src={img} alt="Car" /></figure>
            </div>
            <div className="content">
                <div className="car-detail">
                    <h4 className="car-name">{car}</h4>
                    <div className="city">{city}</div>
                </div>
                <ul className="feature-list">
                    <li className="colored">Initial-Change <span className="price">{initialChange}</span></li>
                    <li>Per Mile/KM: <span className="price">{perMile}</span></li>
                    <li className="colored">Per Stopped Trafic: <span className="price">{traffic}</span></li>
                    <li>Passengers: <span className="price">{passengers}</span></li>
                </ul>
                <div className="btn-box mt-5">
                    <Link href={link} className="theme-btn btn-style-two hover-light">
                        <span className="btn-title">{buttonName}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PricingCardOne;
