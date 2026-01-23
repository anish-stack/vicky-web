import React from 'react';
import Link from 'next/link';

interface PricingCardOneProps {
  img: string;
  car: string;
  price: string;
  includedKm: string;
  pricePerKm: string;
  fuelcharges: string;
  drivercharges: string;
  nightcharges: string
  link: string;
  buttonName: string;
}

const PricingCardOne: React.FC<PricingCardOneProps> = ({
    img,
    car,
    price,
    includedKm,
    pricePerKm,
    fuelcharges,
    drivercharges,
    nightcharges,
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
                    <div className="price">{`₹ ${price}`}</div>
                </div>
                <ul className="feature-list">
                    <li className="colored">Included Km <span className="price">{includedKm}</span></li>
                    <li>Price Per Km: <span className="price">{`₹ ${pricePerKm}`}</span></li>
                    <li className="colored">Fuel Charges: <span className="price">{fuelcharges}</span></li>
                    <li>Driver Charges: <span className="price">{drivercharges}</span></li>
                    <li className="colored">Night Charges: <span className="price">{nightcharges}</span></li>
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
