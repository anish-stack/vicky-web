import CommonBannerOne from "@/components/banners/CommonBanner/One";
import Head from "next/head";
import { Col, Container, Row } from 'react-bootstrap';


export default function DriverAgreement() {

    return (
        <>
            <Head>
                <title>Driver Agreement  - Taxi Safar</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Driver Agreement  "
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Driver Agreement "
            />
            <Container className="my-5">
                <style jsx>{`
                div {
                    line-height: 1.5;
                    padding: 20px;
                }
                hr {
                    margin: 20px 0;
                }
                .section {
                    margin-bottom: 20px;
                }
            `}</style>

                <section className="my-5">
                    <div className="section">
                        <h5>1. Registration Process</h5>
                        <p>Drivers must visit the official website of Taxi Safar and fill out the driver registration form.</p>
                        <p>They must upload valid documents including:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Driving License</li>
                            <li>Aadhar Card</li>
                            <li>PAN Card</li>
                            <li>Vehicle Registration Certificate (RC)</li>
                            <li>Insurance Certificate</li>
                            <li>Pollution Certificate</li>
                            <li>Permit Copy</li>
                            <li>Recent Photograph</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>2. Document Verification</h5>
                        <p>The Taxi Safar admin team will verify all submitted documents within 48–72 hours.</p>
                        <p>Any discrepancies or expired documents will be informed to the driver for correction.</p>
                    </div>

                    <div className="section">
                        <h5>3. Vehicle Inspection</h5>
                        <p>The vehicle must be physically inspected by Taxi Safar’s authorized team or partner center.</p>
                        <p>Vehicle should be clean, well-maintained, and meet all safety and hygiene standards.</p>
                        <p>Taxi Safar branding stickers (if provided) must be applied properly.</p>
                    </div>

                    <div className="section">
                        <h5>4. Driver Training & Orientation</h5>
                        <p>Drivers will be required to attend a brief orientation (online or offline) that covers:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Platform usage and app demo</li>
                            <li>Customer service etiquette</li>
                            <li>Safety rules and regulations</li>
                            <li>Commission, fare policies, and payout structure</li>
                            <li>Emergency/SOS protocols</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>5. Wallet & Trip Policy Briefing</h5>
                        <p>Drivers will be informed that 20% of each trip amount will be held in the wallet.</p>
                        <p>This held amount will be released only after trip completion without any customer complaints.</p>
                    </div>

                    <div className="section">
                        <h5>6. Account Activation</h5>
                        <p>After successful verification and training, the driver profile will be approved and activated.</p>
                        <p>Login credentials and access to the dashboard will be provided to the driver.</p>
                    </div>

                    <div className="section">
                        <h5>7. Trip Accepting Rules</h5>
                        <p>Drivers must keep their app status “Online” to receive bookings.</p>
                        <p>Trips must be accepted promptly and drivers must reach the pickup location on time.</p>
                        <p>Repeated cancellations or delays may result in temporary suspension.</p>
                    </div>

                    <div className="section">
                        <h5>8. Conduct & Compliance</h5>
                        <p>Drivers must behave politely with customers.</p>
                        <p>Smoking, drinking, or any form of misconduct during duty is strictly prohibited.</p>
                        <p>All drivers must comply with local transport authority laws and Taxi Safar policies.</p>
                    </div>

                    <div className="section">
                        <h5>9. Support & Grievance</h5>
                        <p>Drivers can contact Taxi Safar&apos;s Support Team through the Help section on the website or via phone/email.</p>
                        <p>For urgent issues, drivers can use the Emergency/SOS feature in the system.</p>
                    </div>
                </section>

            </Container>
        </>
    );
}
