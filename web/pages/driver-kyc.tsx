import { useCustomerContext } from "@/context/userContext";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { getAllTransactions, getTransactionById } from "./api/transaction";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Toast, ToastContainer } from 'react-bootstrap';
import { updateDriverById } from "./api/driver";
import Head from "next/head";


export default function DriverProfile() {
    const { isAuthenticated, checkAuth } = useAuth();
    const { customerDetail } = useCustomerContext();

    const router = useRouter();

    const [isChecked, setIsChecked] = useState(false);

    const [toastShow, setToastShow] = useState(false);
    const [message, setMessage] = useState('');


    const [toastSuccessShow, setToastSuccessShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
            router.push('/driver-login');
        }
    }, [isChecked, isAuthenticated]);

    const [adharImagePreview, setAdharImagePreview] = useState(null) as any;

    const handleAdharImageChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader() as any;
            reader.onloadend = () => {
                setAdharImagePreview(reader.result);
                formik.setFieldValue("adhar_card", file);
            };
            reader.readAsDataURL(file);
        }
    };


    const formik = useFormik({
        initialValues: {
            adhar_card: '',
            phone_number: ''
        },
        validationSchema: Yup.object({
            adhar_card: Yup.mixed()
                .test('fileFormat', 'Unsupported file format. Only JPG, JPEG, and PNG are allowed', (value: any) => {
                    if ((typeof value != 'undefined') && (typeof value.type != 'undefined')) {
                        return value && (
                            ['image/jpeg', 'image/png'].includes(value.type)
                        );
                    } else return true;
                })
                .test('fileSize', 'File is too large. Maximum size is 5MB', (value: any) => {
                    if ((typeof value != 'undefined') && (typeof value.type != 'undefined')) {
                        return value && (
                            value.size <= 5 * 1024 * 1024
                        );
                    } else return true;
                }),
        }),
        onSubmit: async (values) => {
            if (customerDetail?.id) {
                try {
                    const formData = new FormData();
                    formData.append('phone_number', values.phone_number);
                    if (values.adhar_card) {
                        formData.append('adhar_card', values.adhar_card);
                    }
                    const response = await updateDriverById(customerDetail?.id, formData as any) as any;
                    if (response.status == true) {
                        const data = response?.data;
                        if (data) {
                            try {
                                setToastSuccessShow(true);
                                formik.setFieldValue('phone_number', response?.data?.phone_number || '');
                                setAdharImagePreview(response?.data?.adhar_card ? `${process.env.API_URL}/users/${response?.data?.adhar_card}` : '')
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
                    setMessage(`Something Went Wrong!! ${error}`);
                }
            }

        },
    });

    useEffect(() => {
        if (customerDetail) {
            formik.setFieldValue('phone_number', customerDetail?.phone_number ? customerDetail?.phone_number : '');
            setAdharImagePreview(customerDetail?.adhar_card ? `${process.env.API_URL}/users/${customerDetail?.adhar_card}` : '')
        }
    }, [customerDetail]);

    return (
        <>

            <Head>
                <title>{'Driver KYC'}</title>
            </Head>
            {/* <ToastContainer className="toast-container-custom">
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
            <div className="container" style={{ marginTop: "80px" }}>
                <section className="contact-details driver-profile">
                    <div className="container py-5">
                        <div className="row">
                            <div className="col-lg-12">
                                <form
                                    onSubmit={formik.handleSubmit}
                                    className="profile-form"
                                >
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="mb-3">
                                                <div className="driver-profile-pic">
                                                    <div className="position-relative d-inline-block">
                                                        <img
                                                            src={adharImagePreview || "/images/user/user-profile.png"}
                                                            alt="Profile"
                                                            className="img-thumbnail"
                                                            style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                                                        />
                                                        <input
                                                            type="file"
                                                            name="image"
                                                            className="d-none"
                                                            id="profileImageInput"
                                                            accept="image/*"
                                                            onChange={handleAdharImageChange}
                                                        />
                                                        <label
                                                            htmlFor="profileImageInput"
                                                            className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow profile-pencil"
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </label>
                                                    </div>

                                                </div>
                                                {formik.touched.adhar_card && formik.errors.adhar_card ? (
                                                    <p className="text-danger text-start mb-0 error-message">{formik.errors.adhar_card}</p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    

                                    <div className="">
                                        <input
                                            name="form_botcheck"
                                            className="form-control"
                                            type="hidden"
                                            value=""
                                        />
                                        <button
                                            type="submit"
                                            className="taxisafar-theme-button"
                                            disabled={formik.isSubmitting}
                                        >
                                            <span className="btn-title"> {formik.isSubmitting ? "Please Wait..." : "Submit"}</span>
                                        </button>

                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div> */}
        </>
    );
}
