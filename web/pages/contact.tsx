import CommonBannerOne from "@/components/banners/CommonBanner/One";
import ContactFormOne from "@/components/contact/forms/One";
import ContactMapOne from "@/components/contact/map/One";
import Head from "next/head";

export default function Contact() {

    const map = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3364.801422102741!2d77.21655249999999!3d28.642288399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd79e848755f%3A0x7bd1375552268e17!2sHotel%20Delhi%20Guest%20House!5e1!3m2!1sen!2sin!4v1734580711951!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'

    return (
        <>

            <Head>
                <title>{'Contact US'}</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="Contact Us"
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="Contact"
            />

            <ContactFormOne
                formTitle="Send us email"
                formSubTitle="Feel free to write"
                formButton="Send message"
                contactTitle="Need any help?"
                contactSubTitle="Get in touch with us"
                contactDescription="For any queries, assistance, or business inquiries, feel free to contact us. Our team is always available to help you."
                phoneNoTitle="Have any question?"
                phoneNo="Free 9412222722"
                phoneNoLink="tel:9412222722"
                mailTitle="Write email"
                mail="support@taxisafar.com"
                mailLink="mailto:support@taxisafar.com"
                addressTitle="Visit anytime"
                address="102/60 Rahul Vihar Ghaziabad Uttar Pradesh 201009"
            />

            <ContactMapOne
                iframe={map}
            />

        </>
    );
}
