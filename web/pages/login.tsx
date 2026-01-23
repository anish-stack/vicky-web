import SignFormOnBanner from '@/components/form/signinForm';
import { useCustomerContext } from '@/context/userContext';
import useAuth from '@/hooks/useAuth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
    const { isAuthenticated, checkAuth } = useAuth();
    const { customerDetail } = useCustomerContext();

    const hasRendered = useRef(false);
    const Router = useRouter();
    useEffect(() => {
        if (hasRendered.current && isAuthenticated && customerDetail?.role == 'customer') {
            Router.push('/booking');
        } else {
            hasRendered.current = true;
        }
    }, [isAuthenticated, customerDetail]);

    return (
        <>
            <Head>
                <title>{'Login'}</title>
            </Head>
            <section className='vicky-cab-homebanner'>
                <div className="page-header page-background d-flex justify-content-center align-items-center" style={{ backgroundImage: `url(/images/banner/bg1.jpg)` }}>
                    <div className="container text-center ">
                        <div className='row d-flex items-align-center'>
                            <div className='col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 pb-5 vickycab-booking-form'>
                                <SignFormOnBanner
                                    buttonName="Login"
                                    subTitle="Check Your Booking Details"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
