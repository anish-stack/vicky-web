import CommonBannerOne from "@/components/banners/CommonBanner/One";
import Head from "next/head";
import { Col, Container, Row } from 'react-bootstrap';


export default function PrivacyPolicy() {

    return (
        <>
            <Head>
                <title>Privacy Policy - TaxiSafar.com</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Privacy Policy "
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Privacy Policy"
            />
            <style jsx>{`
                div {  line-height: 1.5; padding: 10px; }
                h1 { border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
                .section { margin-bottom: 10px; }
            `}</style>
            <Container>
                <section className="my-5">
                    <div className="section">
                        <h5>1. Purpose</h5>
                        <p>This policy outlines how Taxi Safar collects, uses, protects, and shares the data of its users and drivers. We are committed to maintaining the privacy and safety of all individuals associated with our platform.</p>
                    </div>

                    <div className="section">
                        <h5>2. Data Collection</h5>
                        <p>We collect the following data to provide and improve our services:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>User&apos;s full name, mobile number, and email ID</li>
                            <li>Pickup and drop locations</li>
                            <li>Payment details (e.g., UPI ID, card info – via secure gateways)</li>
                            <li>Driver&apos;s license, vehicle information, and identity documents</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>3. Use of Data</h5>
                        <p>Collected data is used for:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Processing ride bookings and confirmations</li>
                            <li>Assigning drivers and tracking trips</li>
                            <li>Customer support and grievance redressal</li>
                            <li>Enhancing platform experience through analytics and feedback</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>4. Data Security</h5>
                        <p>We employ strict measures to protect data:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>All personal data is stored on secure servers</li>
                            <li>SSL encryption is used to protect data in transit</li>
                            <li>Regular audits and safety protocols prevent unauthorized access or leaks</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>5. Data Sharing</h5>
                        <p>We do not share personal information with any third party without consent.</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Only necessary user information (like name and location) is shared with assigned drivers</li>
                            <li>Data is shared with government authorities only when legally required</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>6. User Rights</h5>
                        <p>Users have full rights to view, edit, or delete their personal data.</p>
                        <p>Requests can be raised through our Help Section or by contacting support.</p>
                    </div>

                    <div className="section">
                        <h5>7. Children’s Safety</h5>
                        <p>Taxi Safar services are not intended for individuals under the age of 18. Any account identified as belonging to a minor will be deleted promptly.</p>
                    </div>

                    <div className="section">
                        <h5>8. Women’s Safety Policies</h5>
                        <ul className="list-disc list-inside ml-4">
                            <li>Only verified and trained drivers are allowed to service female passengers</li>
                            <li>Immediate action is taken in case of any misconduct</li>
                            <li>An emergency SOS feature is available to all female users during rides</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>9. Emergency Response</h5>
                        <ul className="list-disc list-inside ml-4">
                            <li>All vehicles are GPS-enabled for real-time tracking</li>
                            <li>An emergency response team is on standby 24/7</li>
                            <li>SOS alerts are prioritized and responded to without delay</li>
                        </ul>
                    </div>

                    <div className="section">
                        <h5>10. Policy Updates</h5>
                        <p>Taxi Safar may update this policy from time to time. All updates will be posted on the official website under the &quot;Privacy & Safety&quot; section.</p>
                    </div>
                </section>

            </Container>
        </>
    );
}
