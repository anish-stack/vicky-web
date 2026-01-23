import { useCustomerContext } from '@/context/userContext';
import useAuth from '@/hooks/useAuth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Toast, ToastContainer } from 'react-bootstrap';
import { loginDriver } from '@/pages/api/driver';
import Image from 'next/image';
import { set } from 'nprogress';

export default function DriverLogin() {
    const { isAuthenticated, checkAuth } = useAuth();
    const { customerDetail } = useCustomerContext();
    const router = useRouter();
    const hasRendered = useRef(false);

    const [toastShow, setToastShow] = useState(false);
    const [message, setMessage] = useState('');
    const [toastSuccessShow, setToastSuccessShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorsMessage] = useState('');


    // OTP state
    const [showOTPSection, setShowOTPSection] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [seconds, setSeconds] = useState(30);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (hasRendered.current && isAuthenticated && customerDetail?.role == 'driver') {
            router.push('/driver-dashboard');
        } else {
            hasRendered.current = true;
        }
    }, [isAuthenticated]);

    // Countdown timer for OTP resend starting from 30 seconds


    useEffect(() => {
        if (!showOTPSection) return;

        if (seconds > 0) {
            const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setDisabled(false); // Enable the resend button when countdown reaches 0
        }
    }, [seconds, showOTPSection]);




    const formik = useFormik({
        initialValues: {
            country_code: '+91',
            phone_number: '',
            role: 'driver'
        },
        validationSchema: Yup.object({
            country_code: Yup.string().required('Country code is required'),
            phone_number: Yup.string()
                .required('Phone number is required')
                .matches(/^[0-9]+$/, "Must be only digits")
                .min(10, 'Phone number must be 10 digits')
                .max(10, 'Phone number must be 10 digits'),
        }),
        onSubmit: async (values) => {
            // setShowOTPSection(true);
            try {
                const fullPhoneNumber = `${values.country_code}${values.phone_number}`;
                const loginValues = {
                    phone_number: fullPhoneNumber,
                    role: values.role
                };
                setErrorsMessage('');

                 const response = await loginDriver(values as any) as any;
                 console.log('response', response); 
                 if (response.status == true) {   
                               
                setPhoneNumber(fullPhoneNumber);
                setShowOTPSection(true);
                   setSeconds(30);
                    setDisabled(true);                    
                } else {
                   
                     setMessage(response?.message || 'Something went wrong!');
                     setErrorsMessage(response?.message || 'Something went wrong!');
                 }
            } catch (error) {
                
                setMessage('Something went wrong!');
                setErrorsMessage('Something went wrong!');
            }
        },
    });

    const handleOtpChange = (index: number, value: string) => {
        if (/^\d*$/.test(value) && value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setOtpError('');

            // Auto focus to next input
            if (value && index < 3) {
                const nextInput = document.getElementById(`otp-input-${index + 1}`);
                if (nextInput) nextInput.focus();
            }

            // Auto submit when all fields are filled
            if (newOtp.every(val => val !== '') && newOtp.join('').length === 4) {
                handleVerifyOTP();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyOTP = async () => {
        // const otpValue = otp.join('');
        // if (otpValue.length !== 4) {
        //     setOtpError('Please enter a valid OTP');
        //     return;
        // }

        // try {
        //     const response = await verifyDriverOTP({
        //         phone_number: phoneNumber,
        //         otp: otpValue,
        //         role: 'driver'
        //     }) as any;

        //     if (response.status === true) {
        //         const token = response?.data?.token;
        //         if (token) {
        //             localStorage.setItem('token', token);
        //             setToastSuccessShow(true);
        //             setSuccessMessage('Login successful! Redirecting...');
        //             setTimeout(() => {
        //                 router.push('/driver-dashboard');
        //             }, 2000);
        //         }
        //     } else {
        //         setOtpError(response?.message || 'Invalid OTP. Please try again.');
        //     }
        // } catch (error) {
        //     setOtpError('Something went wrong. Please try again.');
        // }
    };

    const handleResendOTP = async () => {
        console.log('Resending OTP...');
        setSeconds(30);
        setDisabled(true);

        // try {
        //     const response = await resendDriverOTP({
        //         phone_number: phoneNumber,
        //         role: 'driver'
        //     }) as any;

        //     if (response.status === true) {
        //         setToastSuccessShow(true);
        //         setSuccessMessage(response.message);
        // setSeconds(30);
        //         setDisabled(true);
        //         setOtp(['', '', '', '']);
        //         setOtpError('');
        //     } else {
        //         setToastShow(true);
        //         setMessage(response?.message || 'Failed to resend OTP');
        //     }
        // } catch (error) {
        //     setToastShow(true);
        //     setMessage('Failed to resend OTP');
        // }
    };

    return (
        <>
            <Head>
                <title>{'Driver Login'}</title>
            </Head>

            <section className='delivery-login-form-section'>

                <div className='delivery-login-logo-container'>
                <Image src="/images/logo/d-logo.png" alt="logo" width={120} height={20} className='delivery-login-logo' />
                {
                    showOTPSection &&
                    <div className='back-arrow' onClick={() => setShowOTPSection(false)}>
                        <Image src="/images/icons/back-arrow.svg" alt="logo" width={38} height={38} className='delivery-login-logo' />
                    </div>
                }
                </div>

                {
                    !showOTPSection ?
                        <>

                            <div className='delivery-login-info'>

                                <h1 className='delivery-title'>Welcome Back!</h1>
                                <p className='delivery-description'>Login with your mobile number</p>
                            </div>

                            <form className="form" onSubmit={formik.handleSubmit} autoComplete="off">
                                <div className="trip-options">
                                    <div className="">
                                        <div className="mb-3">
                                            <label htmlFor="phone_number" className="delivery-form-level">Mobile Number</label>
                                            <div className="d-flex align-items-center">
                                                <select
                                                    className="form-select me-2"
                                                    style={{ width: '94px' }}
                                                    id="country_code"
                                                    name="country_code"
                                                    value={formik.values.country_code}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                    <option value="+91"> +91</option>
                                                    <option value="+1"> +1</option>
                                                    <option value="+44"> +44</option>
                                                    <option value="+61"> +61</option>
                                                    <option value="+971"> +971</option>
                                                </select>

                                                <input
                                                    type="tel"
                                                    className="delivery-form-control"
                                                    id="phone_number"
                                                    name="phone_number"
                                                    placeholder="Enter your mobile number"
                                                    value={formik.values.phone_number}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </div>
                                            <p className=' error-messages'>{errorMessage}</p>
                                            {formik.touched.phone_number && formik.errors.phone_number ? (
                                                <p className="text-danger text-start mb-0 error-message">{formik.errors.phone_number}</p>
                                            ) : null}
                                        </div>

                                        <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                                            <button
                                                type="submit"
                                                className="taxisafar-theme-button delivery-login-btn w-100"
                                                disabled={formik.isSubmitting}
                                            >
                                                <span className="btn-title">{formik.isSubmitting ? 'Please Wait..' : "Get OTP"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>

                        </> :

                        <div className="otp-verification-section">
                            <h2 className="otp-title">OTP Verification</h2>
                            <p className="otp-description">Enter OTP sent to <span> {phoneNumber}</span></p>


                            <div className='otp-verification-container' >
                                <label htmlFor="phone_number" className="delivery-form-level  ">OTP</label>
                                <div className="otp-input-container">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-input-${index}`}
                                            type="text"
                                            className="otp-input"
                                            placeholder='0'
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            maxLength={1}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {otpError && <p className="text-danger otp-error-message">{otpError}</p>}
                            </div>



                            <button
                                className="taxisafar-theme-button verify-btn w-100 mt-3"
                                onClick={handleVerifyOTP}
                                disabled={otp.join('').length !== 4}
                            >
                                Verify
                            </button>

                            <div className="resend-otp mt-3">
                                <p className="resend-text text-center">
                                    {' '}
                                    <button
                                        type="button"
                                        className="resend-button"

                                        onClick={handleResendOTP}
                                        disabled={disabled}
                                    >
                                        {disabled ? <span style={{ color: "#01000599", fontWeight: "400" }}>  Resend  again in <span style={{ color: "#010005", fontWeight: "600" }}>00:{seconds}</span>  </span> : 'Resend OTP'}
                                    </button>
                                </p>
                            </div>
                        </div>
                }



                {
                    !showOTPSection && <p className='delivery-login-new-user'>
                        <span className=''>New User?</span>
                        <Link href="/driver-register" className="ms-1">Sign Up</Link>
                    </p>
                }



                <ToastContainer position="top-end" className="p-3">
                    <Toast
                        onClose={() => setToastShow(false)}
                        show={toastShow}
                        delay={3000}
                        autohide
                        bg="danger"
                    >
                        <Toast.Body className="text-white">{message}</Toast.Body>
                    </Toast>
                    <Toast
                        onClose={() => setToastSuccessShow(false)}
                        show={toastSuccessShow}
                        delay={3000}
                        autohide
                        bg="success"
                    >
                        <Toast.Body className="text-white">{successMessage}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </section>


        </>
    );
}