import { useCustomerContext } from "@/context/userContext";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { getAllTransactions, getTransactionById } from "./api/transaction";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import moment from "moment";
import Head from "next/head";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import Image from "next/image";
import Link from "next/link";

export default function Booking() {
    const { isAuthenticated, checkAuth } = useAuth();
    const { customerDetail } = useCustomerContext();

    const router = useRouter();

    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (!isChecked) {
            const timer = setTimeout(() => {
                setIsChecked(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isChecked]);

    useEffect(() => {
        if (isChecked && isAuthenticated === false) {
            setIsChecked(false);
            // router.push('/driver-login');
        }
    }, [isChecked, isAuthenticated]);

    const slideData = [
        {
            id: 1,
            type: 'image',
            src: '/images/banner/driver-dashboard-banner-1.png',
            alt: 'Driver Dashboard Banner 1',
        },
        {
            id: 2,
            type: 'image',
            src: '/images/banner/driver-dashboard-banner-1.png',
            alt: 'Driver Dashboard Banner 2',

        },
        {
            id: 3,
            type: 'image',
            src: '/images/banner/driver-dashboard-banner-1.png',
            alt: 'Driver Dashboard Banner 3',

        }
    ];

    const navItems = [
        { id: 1, count: 16, title: 'Taxi Safar Reserve Trip', path: '/reserve-trip' },
        { id: 2, count: 2, title: 'Driver Post Trip', path: '/driver-post' },
        { id: 3, count: 8, title: 'My Pending Trip', path: '/pending-trips' },
    ];

    return (
        <>
            <Head>
                <title>{'Driver Dashboard'}</title>
            </Head>

            <div className="container" style={{ marginTop: "100px" }}>
                <div className="slider-container">
                    <Swiper
                        pagination={{ dynamicBullets: true }}
                        modules={[Pagination]}
                        className="mySwiper"
                    >
                        {slideData.map((slide, index) => (
                            <SwiperSlide key={index}>
                                <Image
                                    src={slide.src}
                                    alt={slide.alt}
                                    width={430}
                                    height={180}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="counter-container">
                    {navItems.map((item) => (
                        <div className="counter-item" key={item.id}>
                            <div className="counter-icon">
                                <h3 className="nav-count">{item.count}</h3>
                                <Link href={item.path} key={item.id}>
                                    <Image
                                        src='/images/icons/right-arrow.svg'
                                        alt={item.title}
                                        width={20}
                                        height={20}
                                    />
                                </Link>
                            </div>
                            <h3 className="nav-title">{item.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* upcoming trips  */}
            <div className="upcoming-trips-container" >
                <h3 className="upcoming-title"> New Upcoming Trips</h3>
                <div className="upcoming-trips-list">
                    <div className="trip-item">
                        <div className="trip-details">
                            <div className="trip-user-info">
                                <Image src='/images/icons/trip-user-icon.svg' alt="user-image" width={47} height={47}></Image>
                                <div>
                                    <h4 className="trip-user-name">Dharmendra T.</h4>
                                    <p className="trip-user-rating">
                                        <Image src='/images/icons/star.svg' className="me-1" alt="user-image" width={12} height={12}></Image>

                                        <span style={{ color: "#000000" }}> 4.8 </span>(127)</p>
                                </div>
                            </div>
                            <div className="trip-user-info-right">
                                <h4 className="trip-price">₹150</h4>
                                <p className="trip-time"> <span style={{ color: "#000000" }}>2.5 km</span> (3 min) </p>
                            </div>
                        </div>
                        <div className="trip-date-details">
                            <div>
                                <p>08 March, 2025 </p>
                                <p>07:00 PM</p>
                            </div>
                            <div></div>
                            <div>
                                <p>08 March, 2025 </p>
                                <p>11:30 PM</p>
                            </div>
                        </div>
                        {/* Add more trip items as needed */}
                    </div>
                </div>

            </div>



        </>

    );
}
