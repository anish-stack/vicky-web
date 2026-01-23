import CommonBannerOne from "@/components/banners/CommonBanner/One";
import Head from "next/head";
import { Container } from 'react-bootstrap';


export default function DriverAgreement() {

    return (
        <>
            <Head>
                <title>Compliance Manual - Taxi Safar</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Compliance Manual"
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Compliance Manual"
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
                .section, p,h2 {
                    margin-bottom: 40px;
                }
            `}</style>

                <h2>Compliance Manual for Taxi Safar<br />(कंप्लायंस मैनुअल – टैक्सी सफर के लिए)</h2>

                <h5>1. Introduction (परिचय)</h5>
                <p>This Compliance Manual outlines the rules, policies, and responsibilities that all drivers, operators, and staff must follow while working with Taxi Safar.<br />
                    यह कंप्लायंस मैनुअल टैक्सी सफर से जुड़े सभी ड्राइवरों, ऑपरेटरों और स्टाफ के लिए नियमों, नीतियों और जिम्मेदारियों को स्पष्ट करता है।</p>

                <h5>2. Licensing & Documentation (लाइसेंसिंग और दस्तावेज़)</h5>
                <p>All drivers must possess valid driving licenses, vehicle registration papers, insurance, and pollution certificates.<br />
                    सभी ड्राइवरों के पास वैध ड्राइविंग लाइसेंस, वाहन रजिस्ट्रेशन पेपर, बीमा और प्रदूषण प्रमाणपत्र होना अनिवार्य है।</p>

                <h5>3. Driver Conduct (ड्राइवर का आचरण)</h5>
                <p>Drivers must be polite, respectful, and professional. Use of abusive language, rude behavior, or harassment is strictly prohibited.<br />
                    ड्राइवर को शिष्ट, सम्मानजनक और प्रोफेशनल व्यवहार करना चाहिए। गाली-गलौच, अभद्र व्यवहार या किसी प्रकार की छेड़छाड़ सख्त वर्जित है।</p>

                <h5>4. Safety Protocols (सुरक्षा प्रोटोकॉल)</h5>
                <p>All vehicles must follow speed limits, traffic laws, and undergo routine safety checks.<br />
                    सभी वाहनों को गति सीमा, ट्रैफिक नियमों का पालन करना होगा और नियमित सुरक्षा जांच करानी होगी।</p>

                <h5>5. Women&rsquo;s Safety (महिलाओं की सुरक्षा)</h5>
                <p>Special safety protocols must be followed for female passengers, including GPS tracking, SOS options, and behavior guidelines.<br />
                    महिला यात्रियों के लिए विशेष सुरक्षा उपायों का पालन अनिवार्य है जैसे GPS ट्रैकिंग, SOS बटन और व्यवहार दिशा-निर्देश।</p>

                <h5>6. Cleanliness (साफ-सफाई)</h5>
                <p>Vehicles must be kept clean and hygienic at all times. Drivers are responsible for interior and exterior cleanliness.<br />
                    वाहन को हमेशा स्वच्छ और साफ-सुथरा रखना आवश्यक है। इसकी जिम्मेदारी ड्राइवर की होगी।</p>

                <h5>7. Booking & Cancellation (बुकिंग और रद्द करना)</h5>
                <p>Drivers must not cancel rides without valid reason. Repeated cancellations may result in penalties or suspension.<br />
                    ड्राइवर बिना उचित कारण के राइड रद्द नहीं कर सकते। बार-बार ऐसा करने पर जुर्माना या निलंबन हो सकता है।</p>

                <h5>8. Alcohol and Drugs (शराब और नशा)</h5>
                <p>Consumption of alcohol or drugs during duty hours is strictly prohibited and may lead to immediate termination.<br />
                    ड्यूटी के दौरान शराब या नशे का सेवन करना सख्त मना है। ऐसा करने पर तत्काल सेवा समाप्त की जा सकती है।</p>

                <h5>9. Fare & Charges (किराया और शुल्क)</h5>
                <p>All fares must be charged as per the rates shown in the app. Overcharging or asking for extra money is not allowed.<br />
                    सभी यात्राओं का किराया ऐप में दर्शाए गए रेट के अनुसार ही लिया जाए। अधिक पैसे माँगना मना है।</p>

                <h5>10. Customer Service (ग्राहक सेवा)</h5>
                <p>Drivers should assist customers in boarding, help with luggage, and be responsive to their needs.<br />
                    ड्राइवर को यात्रियों को बैठने में सहायता करनी चाहिए, सामान रखने में मदद करनी चाहिए और उनकी जरूरतों के प्रति संवेदनशील रहना चाहिए।</p>

                <h5>11. Vehicle Maintenance (वाहन रख-रखाव)</h5>
                <p>All vehicles must be regularly serviced and maintained in good condition.<br />
                    सभी वाहनों की नियमित सर्विसिंग और सही स्थिति में रख-रखाव जरूरी है।</p>

                <h5>12. Stickers & Branding (स्टिकर और ब्रांडिंग)</h5>
                <p>Taxi Safar stickers and branding material must be displayed clearly on the vehicle as instructed.<br />
                    टैक्सी सफर के स्टिकर और ब्रांडिंग सामग्री को वाहन पर स्पष्ट रूप से लगाना अनिवार्य है।</p>

                <h5>13. Complaints & Dispute Resolution (शिकायत और विवाद निवारण)</h5>
                <p>All complaints must be reported to the Taxi Safar support team. Disputes will be resolved as per company policies.<br />
                    सभी शिकायतों को टैक्सी सफर सपोर्ट टीम को रिपोर्ट किया जाना चाहिए। विवाद कंपनी की नीतियों के अनुसार सुलझाए जाएंगे।</p>

                <h5>14. Data Privacy & GPS Usage (डेटा गोपनीयता और GPS उपयोग)</h5>
                <p>Drivers must allow GPS tracking during rides. Any customer data must be kept confidential.<br />
                    ड्राइवर को राइड के दौरान GPS चालू रखना अनिवार्य है। ग्राहक की जानकारी गोपनीय रखनी होगी।</p>

                <h5>15. Penalties & Suspension (जुर्माना और निलंबन)</h5>
                <p>Violation of any clause in this manual may result in penalties, temporary suspension, or permanent removal.<br />
                    इस मैनुअल के किसी भी नियम का उल्लंघन करने पर जुर्माना, अस्थायी निलंबन या स्थायी सेवा समाप्ति की जा सकती है।</p>
            </Container>
        </>
    );
}
