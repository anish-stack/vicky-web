import CommonBannerOne from "@/components/banners/CommonBanner/One";

import Head from "next/head";
import parse from 'html-react-parser';
import { Col, Container, Row } from 'react-bootstrap';

import FAQs from "@/components/taxisafar/FAQs";

export default function FAQ() {

    const BestoutstationServices = [
        {
            id: 1,
            number: "01",
            question: "What types of vehicles are available for outstation travel?",
            answer: "We offer multiple vehicle options such as Hatchback (WagonR, Swift), Sedan (Dzire), SUV (Ertiga, Innova Crysta), or similar based on availability and your booking choice.",
        },
        {
            id: 2,
            number: "02",
            question: "How can I book an outstation taxi?",
            answer: "You can book an outstation taxi by visiting our website [TaxiSafar.com], selecting your pickup and drop location, date, time, and vehicle type. You’ll receive instant confirmation.",
        },
        {
            id: 3,
            number: "03",
            question: "Can I make a one-way booking for outstation?",
            answer: "Yes, we provide one-way as well as round-trip bookings based on your travel needs.",
        },
        {
            id: 4,
            number: "04",
            question: "Will I get a driver who is familiar with long-distance routes?",
            answer: "Yes, we assign experienced drivers trained in outstation routes and customer service for your safety and convenience.",
        },
        {
            id: 5,
            number: "05",
            question: "How early should I book an outstation taxi?",
            answer: "We recommend booking at least 24 hours in advance to ensure vehicle availability and a smooth travel experience.",
        },
        {
            id: 6,
            number: "06",
            question: "Are toll charges, parking, and driver allowance included in the fare?",
            answer: "No, these charges are not included in the base fare. You will need to pay them separately during the trip, unless otherwise mentioned at the time of booking.",
        },
        {
            id: 7,
            number: "07",
            question: "Will I be charged for both sides in a one-way trip?",
            answer: "One-way trip charges depend on the distance and city. In some cases, only one-way fare is applicable, but in certain routes, return fare may also be charged.",
        },
        {
            id: 8,
            number: "08",
            question: "Can I change or cancel my booking?",
            answer: "Yes, you can cancel or reschedule your trip by contacting our support team. Cancellation charges may apply as per our policy.",
        },
        {
            id: 9,
            number: "09",
            question: "Will I receive a travel invoice?",
            answer: "Yes, a proper invoice with fare breakup will be shared with your registered email ID after trip completion.",
        },
        {
            id: 10,
            number: "10",
            question: "Where can I see my booking confirmation and driver details?",
            answer: "You can check booking confirmation and driver details under the 'My Trips' section available in your profile on the website's home screen.",
        },
        {
            id: 11,
            number: "11",
            question: "What if I face any issues during my outstation trip?",
            answer: "Our customer support is available to assist you 24x7. You can call us on our helpline number or use the contact form on our website.",
        },
        {
            id: 12,
            number: "12",
            question: "Is it safe to travel with your outstation taxis?",
            answer: "Absolutely. All our vehicles are GPS-enabled and regularly sanitized. We do background checks on all drivers and ensure safe and comfortable travel for all passengers.",
        },
    ];

    const faqData = [
        {
            id: 1,
            number: "01",
            question: "How to book a taxi on TaxiSafar.com?",
            answer: "Visit our website, enter the pickup and drop location, date, time, and select the vehicle. You can confirm the booking instantly.",
        },
        {
            id: 2,
            number: "02",
            question: "What types of vehicles are available?",
            answer: "We offer hatchbacks, sedans, SUVs, and premium vehicles like WagonR, Swift, Dzire, Ertiga, SUV, Innova Crysta, and Tempo Traveller for passengers.",
        },
        {
            id: 3,
            number: "03",
            question: "Are both one-way and round-trip bookings available?",
            answer: "Yes, we provide both one-way and round-trip services, including Char Dham Yatra, airport pickup-drop, and local city rental services.",
        },
        {
            id: 4,
            number: "04",
            question: "Are tolls, taxes, and parking charges included in the fare?",
            answer: "We provide two pricing options on our website:\n\nBest Price: Only the base fare is included. Toll tax, driver charges, and parking charges are extra.\n\nAll Inclusive Price: Toll tax and driver charges are included. Parking charges are still separate in both options.",
        },
        {
            id: 5,
            number: "05",
            question: "How can I contact support during the journey?",
            answer: "You can call our 24x7 support team at 9412222722 or email us at support@taxisafar.com.",
        },
        {
            id: 6,
            number: "06",
            question: "Can I cancel or reschedule my booking?",
            answer: "Yes, you can cancel or reschedule the booking as per our cancellation policy.",
        },
        {
            id: 7,
            number: "07",
            question: "Is it safe to travel with Taxi Safar?",
            answer: "Absolutely. All our drivers are verified, vehicles are GPS-enabled, and regularly sanitized.",
        },
        {
            id: 8,
            number: "08",
            question: "Does the company offer vehicles for group travel or religious tours?",
            answer: "Yes, we provide services for group travel, Char Dham Yatra, temple visits, and special travel packages.",
        },
        {
            id: 9,
            number: "09",
            question: "What payment options are available?",
            answer: "We support UPI, debit/credit cards, net banking, and cash payments.",
        },
        {
            id: 10,
            number: "10",
            question: "Where will I get booking confirmation and driver details?",
            answer: "Booking confirmation and driver details will be available under the \"My Trips\" section in your profile on the website’s home screen.",
        },
        {
            id: 11,
            number: "11",
            question: "Can I book in advance?",
            answer: "Yes, you can book in advance at any time before your travel date.",
        },
        {
            id: 12,
            number: "12",
            question: "Can I customize my own travel package?",
            answer: "Yes, you can create your custom package based on distance, time, and location.",
        },
    ];




    return (
        <>
            <Head>
                <title>{'FAQs'}</title>
            </Head>
            <CommonBannerOne
                imgURL="/images/background/page-title.png"
                title="FAQs"
                breadcrumbOneTitle="Home"
                breadcrumbOneLink="/"
                breadcrumbTwoTitle="FAQs"
            />



            <FAQs
                title=""
                outstationServices={faqData}
            />




        </>
    );
}
