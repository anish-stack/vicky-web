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
import 'react-phone-number-input/style.css';
import { sendOTP, sendOTPForLogin } from '@/pages/api/customer';

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

    const router = useRouter();

    const [toastShow, setToastShow] = useState(false);
    const [message, setMessage] = useState('');

    const [phone, setPhone] = useState('');

    const [toastSuccessShow, setToastSuccessShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            name: '',
            phone_number: '',
        },
        validationSchema: Yup.object({
            phone_number: Yup.string()
                .required('Phone number is required')
                .min(5, 'Phone number must be at least 5 characters long')
                .max(15, 'Phone number cannot be more than 15 characters long'),
        }),
        onSubmit: async (values) => {
            try {
                NProgress.start();
                const response = await sendOTPForLogin(values as any) as any;
                if (response.status == true) {
                    try {
                        sessionStorage.setItem('name', values.name);
                        sessionStorage.setItem('phone_number', values.phone_number);
                        setToastSuccessShow(true);
                        setSuccessMessage(`${response?.message}`);
                        setTimeout(() => {
                            router.push(`/verifyotp`);
                        }, 3100);
                        NProgress.done();
                    } catch (error) {
                        setToastShow(true);
                        setMessage(`Something Went Wrong!!`);
                        NProgress.done();
                    }
                } else if (response.status == false) {
                    setToastShow(true);
                    setMessage(`${response?.message}`);
                    NProgress.done();
                } else {
                    setToastShow(true);
                    setMessage(`Something Went Wrong!!`);
                    NProgress.done();
                }
            } catch (error) {
                setToastShow(true);
                setMessage(`Something Went Wrong!!`);
                NProgress.done();
            }

        },
    });
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
                            {/* <div className="mt-3 custom-input position-relative">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter Your Name"
                                    className="custom-text-input"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <i
                                    className="icon fa-regular fa-user position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>
                            </div>
                            {formik.touched.name && formik.errors.name ? (
                                <p className="text-danger text-start mb-0 error-message">{formik.errors.name}</p>
                            ) : null} */}

                            <div className="mt-3 custom-input position-relative">
                                <PhoneInput
                                    placeholder="Enter WhatsApp Number"
                                    value={formik.values.phone_number}
                                    defaultCountry="IN"
                                    onChange={(value) => {
                                        formik.setFieldValue('phone_number', value);
                                    }}
                                    onBlur={formik.handleBlur}
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

                            <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                                <button
                                    type="submit"
                                    className="taxisafar-theme-button w-100"
                                    disabled={formik.isSubmitting}
                                >
                                    <span className="btn-title">{formik.isSubmitting ? 'Please Wait..' : 'Send OTP & Login'}</span>
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
