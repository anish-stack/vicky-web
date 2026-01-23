import CommonBannerOne from "@/components/banners/CommonBanner/One";

// import HomeService from "@/components/taxisafar/homeService";
import Head from "next/head";
import { Col, Container, Row } from 'react-bootstrap';

export default function Services() {


    return (
        <>
            <Head>
                <title>{'Taxi Safar - Our Services'}</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Our Services"
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Our Services"
            />
            <div className="taxisafar-section">

                <Container>
                    <div className="taxisafar-about">

                        <div>

                            <h3 className="taxisafar-title mt-4">
                                Our Services
                            </h3>
                            <p className="taxisafar-description mt-4">
                                At Taxi Safar, we provide various types of taxi services designed to meet all your travel needs. Whether you need an outstation trip (One-Way & Round Trip), airport transfer, business travel, car rental, or Char Dham Yatra Uttarakhand, we bring you the most reliable and affordable solutions.
                            </p>




                            <Row className="mt-4">
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        Local Rental
                                    </h3>
                                    (Local Rental Service):
                                    Book a car on an hourly basis and make your entire day&apos;s travel convenient. This service is for travelers who need to visit multiple locations within the city.
                                </Col>
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        Outstation Trips (Outstation Trips )
                                    </h3>
                                    (One-Way & Round Trip):
                                    We offer one-way drops, round trips, and family packages for long-distance travel. You can plan your journey to major destinations in Uttarakhand, Himachal, Rajasthan, and other states.
                                </Col>
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        Airport Transfers (Airport Transfers):
                                    </h3>
                                    Timely pickup and drop service to major airports like Delhi, Lucknow, Chandigarh, and Jaipur.
                                </Col>
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        Corporate Cab Service (Corporate Cab Service):
                                    </h3>
                                    Special taxi services for businesses, including monthly packages, regular trips, and executive car services.
                                </Col>
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        One-Way Drop Trip (One-Way Taxi Service):
                                    </h3>
                                    Affordable taxi service for one-way travel, so you don’t have to pay for the full fare.
                                </Col>
                            </Row>
                            <Row className="mt-4">
                                <Col xs={12}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">🏔️ Char Dham Yatra - Uttarakhand</h3>

                                    <p> Travel to Char Dham Yatra with Taxi Safar! </p>
                                    <ul>
                                        <li>✅ <strong>Ek Dham Yatra:</strong> Special packages for Kedarnath, Badrinath, Gangotri, or Yamunotri.</li>
                                        <li>✅ <strong>Do Dham Yatra:</strong> Kedarnath-Badrinath or Gangotri-Yamunotri travel options.</li>
                                        <li>✅ <strong>Char Dham Yatra:</strong> Full Yatra of Yamunotri, Gangotri, Kedarnath, and Badrinath.</li>
                                    </ul>
                                    <p><strong>Features:</strong></p>
                                    <ul>
                                        <li>✔ Safe and experienced drivers</li>
                                        <li>✔ Comfortable, well-maintained vehicles</li>
                                        <li>✔ Affordable and transparent pricing</li>
                                        <li>✔ Customizable travel plans</li>
                                        <li>✔ 24/7 support</li>
                                    </ul>
                                </Col>

                                <Col xs={12} className="mt-4">
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">🏨 Hotel Booking (COMING SOON)</h3>
                                    <p>
                                        Soon, you’ll be able to book budget hotels, luxury hotels, and family stays right from the Taxi Safar platform.
                                        Our upcoming hotel service will be affordable, reliable, and convenient.
                                    </p>
                                </Col>

                                <Col xs={12} className="mt-4">
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">💰 Best Price & All-Inclusive Packages</h3>
                                    <ul>
                                        <li>1️⃣ <strong>Best Price Booking:</strong> Pay basic fare only. Other charges like tolls and taxes are separate.</li>
                                        <li>2️⃣ <strong>All-Inclusive Package:</strong> Includes toll tax, state tax, and driver expenses. Only parking is extra.</li>
                                    </ul>
                                </Col>

                                <Col xs={12} className="mt-4">
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">🕒 24/7 Availability & Secure Ride</h3>
                                    <ul>
                                        <li>🔒 Verified drivers & GPS-enabled vehicles</li>
                                        <li>💳 Multiple payment options: UPI, cards, net banking, cash, wallets</li>
                                        <li>📞 24/7 support to assist you anytime</li>
                                    </ul>
                                </Col>

                                <Col xs={12} className="mt-4 text-center">
                                    <p> Taxi Safar is always ready to make your journey easy, safe, and affordable! </p>
                                    <p>
                                        📞 <strong>941 2222 722</strong> <br />
                                        📧 <strong>Support@TaxiSafar.Com</strong> <br />
                                        🌐 <strong>Www.TaxiSafar.Com</strong>
                                    </p>
                                </Col>
                            </Row>



                            {/* <div className="mt-4">
                            <button className="taxisafar-theme-button" onClick={handleBookTaxi}>
                                {buttonName} <i className="fa-solid fa-arrow-right ms-1"></i>
                            </button>
                        </div> */}
                        </div>

                    </div>
                </Container>



            </div>
            {/* <HomeService
                title="Latest Services"
                subtitle="Explore our top-rated services"
                latestServices={latestServices}
            /> */}

        </>
    );
}
