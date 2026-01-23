import CommonBannerOne from "@/components/banners/CommonBanner/One";
// import IconInfoOne from "@/components/iconInfo/One";
// import ServiceSectionOne from "@/components/services/One";
// import HomeAboutUsSectionOne from "@/components/about/One";
// import HomeAbout from "@/components/taxisafar/homeAbout";
// import HomeService from "@/components/taxisafar/homeService";
import Head from "next/head";
// import parse from 'html-react-parser';
import { Col, Container, Row } from 'react-bootstrap';
import Link from "next/link";

export default function About() {

    // const features = [
    //     { iconClass: 'fal fa-calendar-check', text: 'Online Booking' },
    //     { iconClass: 'fal fa-headset', text: '24/7 Support' },
    // ];

    // const serviceData = [
    //     {
    //         title: "Business Transfer",
    //         description: "Lorem ipsum dolor sit amet",
    //         imageUrl: "images/resource/features1-1.jpg",
    //         link: "#",
    //     },
    //     {
    //         title: "Online Booking",
    //         description: "Lorem ipsum dolor sit amet",
    //         imageUrl: "images/resource/features1-1.jpg",
    //         link: "#",
    //     },
    //     {
    //         title: "City Transport",
    //         description: "Lorem ipsum dolor sit amet",
    //         imageUrl: "images/resource/features1-1.jpg",
    //         link: "#",
    //     },
    //     {
    //         title: "Corporate Cab",
    //         description: "Lorem ipsum dolor sit amet",
    //         imageUrl: "images/resource/features1-1.jpg",
    //         link: "#",
    //     },
    // ];

    // const workBlocks = [
    //     {
    //         icon: "fa-light fa-taxi",
    //         title: "Book in Just 2 Tabs",
    //         text: "Curabitur ac quam aliquam vehicula semper sed vel elit et leo purus.",
    //     },
    //     {
    //         icon: "fa-sharp fa-light fa-map-location",
    //         title: "Track your driver",
    //         text: "Curabitur ac quam aliquam vehicula semper sed vel elit et leo purus.",
    //     },
    //     {
    //         icon: "fa-sharp fa-light fa-truck-pickup",
    //         title: "Pick & arrive safely",
    //         text: "Curabitur ac quam aliquam vehicula semper sed vel elit et leo purus.",
    //     },
    // ];
    // const latestServices = [
    //     {
    //         imgSrc: "/images/services/airport-transfer.jpg",
    //         title: "Airport Transport",
    //         description:
    //             "Enjoy a smooth airport ride with our reliable cabs. Simply select your airport, pickup, and drop-off city!",
    //     },
    //     {
    //         imgSrc: "/images/services/online-booking.jpg",
    //         title: "Online Booking",
    //         description:
    //             "Book your cab online in seconds! Enjoy safe, comfortable, and reliable rides anytime, anywhere.",
    //     },
    //     {
    //         imgSrc: "/images/services/local-rental.jpg",
    //         title: "Local Rental",
    //         description:
    //             "Travel effortlessly with our city transport service—fixed-hour and kilometer packages for a smooth, reliable ride.",
    //     },
    // ];
    return (
        <>
            <Head>
                <title>{'About Us'}</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="About Us"
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="About Us"
            />
            <div className="taxisafar-section">

                <Container>
                    <div className="taxisafar-about">

                        <div>
                            <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                About Us – Taxi Safar
                            </h3>
                            <h3 className="taxisafar-title mt-4">
                                Who We Are
                            </h3>

                            <p className="taxisafar-description mt-4">
                                Taxi Safar is a trusted and customer-centric taxi service operated by VCS Fleet Private Limited. Our mission is to provide safe, reliable, and affordable transportation solutions for daily commutes, business trips, and outstation travel. With a fleet of well-maintained vehicles and professional drivers, we ensure a comfortable and seamless ride experience for our customers.
                            </p>




                            <Row className="mt-4">
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        Our Vision
                                    </h3>
                                    Vision: To become the most preferred taxi service provider known for reliability, affordability, and safety.

                                </Col>
                                <Col xs={6}>
                                    <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                        Our Mission
                                    </h3>
                                    Mission: To offer high-quality, tech-driven, and customer-friendly transportation services that meet the evolving mobility needs of our passengers.
                                </Col>
                            </Row>


                            <div className="contact">
                                <Row>

                                    <Col xs={12}>
                                        <Row className="my-3">


                                            <Col xs={12} className="ps-4 align-items-center">

                                                <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                                    What We Offer
                                                </h3>
                                                <ul>
                                                    <li>
                                                        Outstation Travel – Comfortable long-distance trips.
                                                    </li>
                                                    <li>
                                                        Airport Transfers – Hassle-free pickups and drop-offs.
                                                    </li>
                                                    <li>
                                                        Corporate Travel – Customized transport solutions for businesses.
                                                    </li>
                                                    <li>
                                                        Rental Services – Hourly or daily car rentals with drivers.
                                                    </li>

                                                </ul>
                                            </Col>
                                            <Col xs={12} className="ps-4 align-items-center">

                                                <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                                    Why Choose Taxi Safar?
                                                </h3>
                                                <ul>
                                                    <li>
                                                        Safe & Verified Drivers – Background-checked and trained professionals.
                                                    </li>
                                                    <li>
                                                        Affordable Fares – Transparent pricing with no hidden charges.
                                                    </li>
                                                    <li>
                                                        24/7 Availability – Book a ride anytime, anywhere.
                                                    </li>
                                                    <li>
                                                        GPS Tracking & SOS Support – Safety features for a secure ride.
                                                    </li>
                                                    <li>
                                                        Multiple Payment Options – Pay via cash, UPI, wallets, or cards.
                                                    </li>
                                                </ul>
                                            </Col>
                                            <Col xs={12} className="ps-4 align-items-center">

                                                <h3 className="taxisafar-main-title taxisafar-mobile-main-title">
                                                    Join Us on the Journey!
                                                </h3>
                                                <p>
                                                    Taxi Safar is more than just a ride; it&rsquo;s a commitment to quality service. Whether you&rsquo;re commuting within the city or planning an outstation trip, we are here to make your journey smooth and comfortable.
                                                </p>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <p>For bookings and inquiries, contact us at:</p>

                                    <Col xs={4}>
                                        <Row>
                                            <Col xs={2}>
                                                <div className="icon">
                                                    <img src="/images/icons/phone.png" width="28" height="28" />
                                                </div>
                                            </Col>

                                            <Col xs={10} className="ps-3">
                                                <p className="title mb-0">
                                                    Call Anytime
                                                </p>
                                                <Link href="tel:+919412222722">+91 94122 22722</Link>
                                            </Col>
                                        </Row>


                                    </Col>

                                    <Col xs={4}>
                                        <Row className="">
                                            <Col xs={2}>
                                                <div className="icon">
                                                    <img src="/images/icons/mail.png" width="28" height="28" />
                                                </div>
                                            </Col>

                                            <Col xs={10} className="ps-3">
                                                <p className="title mb-0">
                                                    Email
                                                </p>
                                                <Link href="mailto:support@taxisafar.com">support@taxisafar.com</Link>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={4}>
                                        <Row className="mt-3">
                                            <Col xs={2}>
                                                <div className="icon">
                                                    <img src="/images/icons/support.png" width="28" height="28" />
                                                </div>
                                            </Col>

                                            <Col xs={10} className="ps-4 d-flex align-items-center">
                                                <h5 className="title">24/7 Support</h5>
                                            </Col>
                                        </Row>
                                    </Col>


                                </Row>

                            </div>










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
