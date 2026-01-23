import React, { useCallback, useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
// import Link from 'next/link';
import { useRouter } from 'next/router';
// import PhoneInputTwo from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// import { createSession, getSessionById, Model, updateBySessionId } from '@/pages/api/sessions';
import { Toast, ToastContainer } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css';
import { sendOTP, sendOTPForLogin } from '@/pages/api/customer';
import { createDriver, loginDriver } from '@/pages/api/driver';

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


    const [toastSuccessShow, setToastSuccessShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            phone_number: '',
            password: '',
            role: 'driver'
        },
        validationSchema: Yup.object({
            phone_number: Yup.string()
                .required('Phone number is required')
                .min(5, 'Phone number must be at least 5 characters long')
                .max(15, 'Phone number cannot be more than 15 characters long'),
            password: Yup.string()
                .required('Password is required')
                .min(8, 'Password must be at least 8 characters long')
                .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .matches(/[0-9]/, 'Password must contain at least one number')
                .matches(/[\W_]/, 'Password must contain at least one special character')
        }),
        onSubmit: async (values) => {
            try {
                const response = await loginDriver(values as any) as any;
                if (response.status == true) {
                    const token = response?.data?.token;
                    if (token) {
                        try {
                            setToastSuccessShow(true);
                            localStorage.setItem('token', token);
                            setTimeout(() => {
                                // router.push('/booking');
                                router.push('/driver-dashboard');
                            }, 3100);
                            setSuccessMessage(`${response?.message}`);
                        } catch (error) {
                            setToastShow(true);
                            setMessage(`Something Went Wrong!!`);
                        }
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
                <form className="form" onSubmit={formik.handleSubmit} autoComplete="off">
                    <div className="trip-options">
                        <div className="">

                            <div>
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
                            </div>

                            <div>
                                <div className='mt-3 custom-input position-relative'>
                                    <input
                                        type="password"
                                        placeholder="Please Enter Your Password"
                                        name='password'
                                        className='custom-text-input'
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        autoComplete="new-password"
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
                                {formik.touched.password && formik.errors.password ? (
                                    <p className="text-danger text-start mb-0 error-message">{formik.errors.password}</p>
                                ) : null}
                            </div>

                            <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                                <button
                                    type="submit"
                                    className="taxisafar-theme-button w-100"
                                    disabled={formik.isSubmitting}
                                >
                                    <span className="btn-title">{formik.isSubmitting ? 'Please Wait..' : buttonName}</span>
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
