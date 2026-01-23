import CommonBannerOne from "@/components/banners/CommonBanner/One";
import Head from "next/head";
import Link from "next/link";
import { Col, Container, Row } from 'react-bootstrap';


export default function TermsOfUse() {

    return (
        <>
            <Head>
                <title>Terms of Use - Taxi Safar</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Terms of Use "
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Terms of Use"
            />
            <style jsx>{`
                section{
                    margin: 40px;line-height: 1.6;
                }
                h3 {
                    text-align: center;
                }
                strong {
                    display: block;margin-top: 20px;margin-bottom: 10px;font-size:25px;
                }
                .section , p{ margin-bottom: 40px; }
            `}</style>
            <Container className="my-5">

                <section>
                    <h3>Terms of Use - Taxi Safar</h3>

                </section>
                <section className="my-5">
                    <div className="section">
                        <h5>1. Account Registration</h5>
                        <p>Users must register their account with accurate information to use the services of Taxi Safar.</p>
                    </div>

                    <div className="section">
                        <h5>2. Use of Service</h5>
                        <p>Users can book taxi services for local, outstation, and pilgrimage travel (such as Char Dham) through the website.</p>
                    </div>

                    <div className="section">
                        <h5>3. Booking and Confirmation</h5>
                        <p>A booking is considered confirmed only after successful payment and receipt of a confirmation message by the user.</p>
                    </div>

                    <div className="section">
                        <h5>4. Pricing and Charges</h5>
                        <p>Fare depends on the vehicle type, travel distance, and the selected package.</p>
                    </div>

                    <div className="section">
                        <h5>5. Cancellation and Refund</h5>
                        <p>For complete information regarding cancellation and refunds, please refer to our <a href="/cancellation-policy">[Cancellation & Refund Policy]</a>.</p>
                    </div>

                    <div className="section">
                        <h5>6. User Conduct</h5>
                        <p>Users must behave respectfully and not misuse the service in any manner.</p>
                    </div>

                    <div className="section">
                        <h5>7. Safety Guidelines</h5>
                        <p>Wearing seat belts during travel, following traffic rules, and avoiding any kind of harassment is mandatory.</p>
                    </div>

                    <div className="section">
                        <h5>8. Driver Responsibilities</h5>
                        <p>Drivers are expected to be punctual, maintain cleanliness, and behave politely with passengers.</p>
                    </div>

                    <div className="section">
                        <h5>9. Limitation of Liability</h5>
                        <p>Taxi Safar shall not be held liable for any delay or damages caused due to weather, technical faults, traffic, or third-party failure.</p>
                    </div>

                    <div className="section">
                        <h5>10. Privacy and Data Use</h5>
                        <p>We collect only essential data related to bookings. Please refer to our <Link href="/privacy-policy">[Privacy Policy]</Link>.</p>
                    </div>

                    <div className="section">
                        <h5>11. Payment Terms</h5>
                        <p>All bookings require online payment through a secure payment gateway.</p>
                    </div>

                    <div className="section">
                        <h5>12. Dispute Resolution</h5>
                        <p>In case of any dispute, it will be resolved via email or through the grievance redressal cell.</p>
                    </div>

                    <div className="section">
                        <h5>13. Platform Rights</h5>
                        <p>Taxi Safar reserves the right to modify its terms of service, pricing, or features without prior notice.</p>
                    </div>
                </section>


            </Container>
        </>
    );
}
