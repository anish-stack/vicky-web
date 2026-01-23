import React, { useCallback, useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cursorTo } from 'readline';
import { useTripContext } from '@/context/TripContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PhoneInputTwo from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createSession, getSessionById, Model, updateBySessionId } from '@/pages/api/sessions';
import { Toast, ToastContainer } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { loginCustomer, sendOTPForLogin, verifyCustomerDriverByToken } from '@/pages/api/customer';
import useAuth from '@/hooks/useAuth';
import NProgress from "nprogress";
import 'nprogress/nprogress.css';

interface FormTwoProps {
    buttonName: string,
    subTitle: string
}

const FormTwo: React.FC<FormTwoProps> = ({
    buttonName,
    subTitle
}) => {

    const [toastShow, setToastShow] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const [toastSuccessShow, setToastSuccessShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [seconds, setSeconds] = useState(60);
    const [disabled, setDisabled] = useState(true);


    useEffect(() => {
        if (typeof window !== "undefined") {
            const phone_number = sessionStorage.getItem('phone_number');
            // const name = sessionStorage.getItem('name');

            if (phone_number) {
                formik.setFieldValue('phone_number', phone_number);
                // formik.setFieldValue('name', name);
            } else {
                router.push('/login');
            }
        }
    }, [router]);

    const formik = useFormik({
        initialValues: {
            name: '',
            phone_number: '',
            OTP: ''
        },
        validationSchema: Yup.object({
            phone_number: Yup.string()
                .required('Phone number is required')
                .min(5, 'Phone number must be at least 5 characters long')
                .max(15, 'Phone number cannot be more than 15 characters long'),
            OTP: Yup.string()
                .required('OTP is required')
                .matches(/^\d{4}$/, 'OTP must be a 4-digit number'),
        }),
        onSubmit: async (values) => {
            try {
                NProgress.start();
                const response = await loginCustomer(values as any) as any;

                if (response.status == true) {
                    const token = response?.data?.token;
                    if (token) {
                        setToastSuccessShow(true);
                        setSuccessMessage(response?.message);
                        localStorage.setItem('token', token);
                        setTimeout(() => {
                            router.push('/booking');
                        }, 3100);
                    } else {
                        console.error('Token not found in the response');
                    }
                    NProgress.done();

                } else if (response.status == false) {
                    setToastShow(true);
                    setMessage(response?.message);
                    NProgress.done();

                }
            } catch (error) {
                setToastShow(true);
                setMessage('Something Went Wrong!!');
                NProgress.done();
            }
        },
    });

    const resendOTP = async () => {
        if (formik.values.phone_number) {
            try {
                const response = await sendOTPForLogin({ phone_number: formik.values.phone_number } as any) as any;
                if (response.status == true) {
                    try {
                        setToastSuccessShow(true);
                        setSuccessMessage(`${response?.message}`);
                        setSeconds(60);
                        setDisabled(true);
                    } catch (error) {
                        setToastShow(true);
                        setMessage(`Something Went Wrong!!`);
                    }
                } else if (response.status == false) {
                    setToastShow(true);
                    setMessage(`${response?.message}`);
                } else {
                    setToastShow(true);
                    setMessage(`Something Went Wrong!!`);
                }
            } catch (error) {
                setToastShow(true);
                setMessage(`Something Went Wrong!!`);
            }
        }
    }

    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setDisabled(false);
        }
    }, [seconds]);


    return (
        <>
            <ToastContainer className="toast-container-custom">
                <Toast
                    onClose={() => setToastShow(false)}
                    show={toastShow}
                    delay={3000}
                    autohide
                    className="bg-danger text-white"
                >
                    <Toast.Header>
                        <strong className="me-auto">Message</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body className='text-start'>{message}</Toast.Body>
                </Toast>
            </ToastContainer>

            <ToastContainer className="toast-container-custom">
                <Toast
                    onClose={() => setToastSuccessShow(false)}
                    show={toastSuccessShow}
                    delay={3000}
                    autohide
                    className="bg-success text-white"
                >
                    <Toast.Header>
                        <strong className="me-auto">Message</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body className='text-start'>{successMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
            <div className='banner-one-form signin-form mt-5'>
                <h3 className='form-title mb-0'>{subTitle}</h3>
                <form className="form" onSubmit={formik.handleSubmit}>
                    <div className="trip-options">
                        <div className="">
                            <div className="mt-3 custom-input phone-input-custom position-relative">
                                <PhoneInput
                                    placeholder="Enter WhatsApp Number"
                                    value={formik.values.phone_number}
                                    defaultCountry="IN"
                                    onChange={(value) => {
                                        formik.setFieldValue('phone_number', value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    disabled
                                />
                                <i
                                    className="icon fa-regular fa-phone-volume position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>

                            </div>
                            {formik.touched.phone_number && formik.errors.phone_number ? (
                                <p className="text-danger text-start mb-0 error-message">{formik.errors.phone_number}</p>
                            ) : null}

                            <div className='mt-3 custom-input position-relative'>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    name='OTP'
                                    className='custom-text-input'
                                    value={formik.values.OTP}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <i
                                    className="icon fa-regular fa-lock position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>

                            </div>
                            {formik.touched.OTP && formik.errors.OTP ? (
                                <p className="text-danger text-start mb-0 error-message">{formik.errors.OTP}</p>
                            ) : null}

                            <p
                                className={disabled ? "text-muted mb-0 resend-otp" : "text-primary custom-cursor-pointer mb-0 resend-otp"}
                                onClick={() => {
                                    if (!disabled) {
                                        resendOTP();
                                    }
                                }}
                            >
                                {disabled ? `Resend OTP in ${seconds}s` : "Resend OTP"}
                            </p>

                            <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                                <button
                                    type="submit"
                                    className="taxisafar-theme-button w-100"
                                    disabled={formik.isSubmitting}
                                // disabled={!formik.isValid}
                                >
                                    <span className="btn-title">{formik.isSubmitting ? 'Please Wait...' : 'Verify & Login'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

            </div>
        </>

    );
};

export default FormTwo;
