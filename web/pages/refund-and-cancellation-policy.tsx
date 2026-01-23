import CommonBannerOne from "@/components/banners/CommonBanner/One";
import Head from "next/head";
import { Col, Container, Row } from 'react-bootstrap';


export default function TermsOfUse() {

    return (
        <>
            <Head>
                <title>Refund & Cancellation Policy - Taxi Safar</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Refund & Cancellation Policy "
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Refund & Cancellation Policy"
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


                <section className="my-5">
                    <div className="section">
                        <h5>1. Cancellation by the Customer</h5>
                        <p>If a customer cancels the booking before the scheduled trip date, a minimum cancellation fee will be charged as per the fare policy. The remaining amount, if any, will be refunded as per the terms.</p>
                    </div>
                    <div className="section">
                        <h5>2. Cancellation after Vehicle Dispatch</h5>
                        <p>If the vehicle has already been dispatched to the pickup location and the customer cancels afterward, the base fare will be non-refundable. The remaining amount (if applicable) will be calculated based on the situation.</p>
                    </div>
                    <div className="section">
                        <h5>3. No Show by the Customer</h5>
                        <p>If the customer does not report at the scheduled time and location, and no prior cancellation request is made, the paid amount will not be refundable.</p>
                    </div>
                    <div className="section">
                        <h5>4. Cancellation by Taxi Safar</h5>
                        <p>In case the booking is canceled by Taxi Safar due to operational or technical reasons, the customer will receive a 100% full refund of the amount paid.</p>
                    </div>
                    <div className="section">
                        <h5>5. Refund Process & Timeline</h5>
                        <p>If the booking is eligible for a refund, the amount will be processed and credited to the original payment method (UPI, debit/credit card, net banking, etc.) within 7 to 10 working days.</p>
                    </div>
                    <div className="section">
                        <h5>6. Additional Charges</h5>
                        <p>Bank or payment gateway charges (if applicable) may be deducted during the refund process.</p>
                    </div>
                    <div className="section">
                        <h5>7. For Assistance</h5>
                        <p>For any support regarding cancellation or refund, please visit our Help Section on the website or contact us:</p>
                        <p className="mb-0">Email: <a href="mailto:support@taxisafar.com" className="text-blue-600 underline">support@taxisafar.com</a></p>
                        <p className="mb-0">Phone: <a href="tel:+919412222722" className="text-blue-600 underline">+91-9412222722</a></p>
                    </div>
                </section>



            </Container>
        </>
    );
}
