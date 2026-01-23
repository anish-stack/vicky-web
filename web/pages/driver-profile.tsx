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

    const [imagePreview, setImagePreview] = useState(null) as any;

    const handleImageChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader() as any;
            reader.onloadend = () => {
                setImagePreview(reader.result);
                formik.setFieldValue("image", file);
            };
            reader.readAsDataURL(file);
        }
    };


    const formik = useFormik({
        initialValues: {
            phone_number: '',
            name: '',
            image: '',
            address: '',
            city: '',
            pin_code: ''
        },
        validationSchema: Yup.object({
            image: Yup.mixed()
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
                    formData.append('name', values.name);
                    if (values.image) {
                        formData.append('image', values.image);
                    }
                    formData.append('address', values.address);
                    formData.append('city', values.city);
                    formData.append('pin_code', values.pin_code);

                    const response = await updateDriverById(customerDetail?.id, formData as any) as any;
                    if (response.status == true) {
                        const data = response?.data;
                        if (data) {
                            try {
                                setToastSuccessShow(true);
                                formik.setFieldValue('phone_number', response?.data?.phone_number || '');
                                formik.setFieldValue('name', response?.data?.name || '');
                                formik.setFieldValue('address', response?.data?.address || '');
                                formik.setFieldValue('city', response?.data?.city || '');
                                formik.setFieldValue('pin_code', response?.data?.pin_code || '');
                                setImagePreview(response?.data?.image ? `${process.env.API_URL}/users/${response?.data?.image}` : '')
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
            }

        },
    });

    useEffect(() => {
        if (customerDetail) {
            formik.setFieldValue('phone_number', customerDetail?.phone_number ? customerDetail?.phone_number : '');
            formik.setFieldValue('name', customerDetail?.name ? customerDetail?.name : '');
            formik.setFieldValue('address', customerDetail?.address ? customerDetail?.address : '');
            formik.setFieldValue('city', customerDetail?.city ? customerDetail?.city : '');
            formik.setFieldValue('pin_code', customerDetail?.pin_code ? customerDetail?.pin_code : '');
            setImagePreview(customerDetail?.image ? `${process.env.API_URL}/users/${customerDetail?.image}` : '')
        }
    }, [customerDetail]);

    return (
        <>
            <Head>
                <title>{'Driver Profile'}</title>
            </Head>
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
                                        {/* <div className="col-sm-6">
                                            <div className="mb-3">
                                                <label className="mb-1">Image</label>
                                                <input
                                                    name="image"
                                                    className="form-control"
                                                    type="file"
                                                    placeholder="Please Select the image"
                                                    value={formik.values.image}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </div>
                                        </div> */}

                                        <div className="col-sm-12">
                                            <div className="mb-3">
                                                <div className="driver-profile-pic">
                                                    <div className="position-relative d-inline-block">
                                                        <img
                                                            src={imagePreview || "/images/user/user-profile.png"}
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
                                                            onChange={handleImageChange}
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
                                                {formik.touched.image && formik.errors.image ? (
                                                    <p className="text-danger text-start mb-0 error-message">{formik.errors.image}</p>
                                                ) : null}
                                            </div>

                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <label className="mb-1">Name</label>
                                                <input
                                                    name="name"
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Enter Name"
                                                    value={formik.values.name}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <label className="mb-1">Phone Number</label>
                                                <input
                                                    name="form"
                                                    className="form-control required"
                                                    type="text"
                                                    placeholder="Enter Phone Number"
                                                    value={formik.values.phone_number}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <div className="mb-3">
                                                <label className="mb-1">Address</label>
                                                <input
                                                    name="address"
                                                    className="form-control required"
                                                    type="text"
                                                    placeholder="Enter Address"
                                                    value={formik.values.address}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="mb-3">
                                                <label className="mb-1">City</label>
                                                <input
                                                    name="city"
                                                    className="form-control required"
                                                    type="text"
                                                    placeholder="Enter Your City Name"
                                                    value={formik.values.city}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="mb-3">
                                                <label className="mb-1">Pincode</label>
                                                <input
                                                    name="pin_code"
                                                    className="form-control required"
                                                    type="text"
                                                    placeholder="Enter Your Pincode"
                                                    value={formik.values.pin_code}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="">
                                        {/* <input
                                            name="form_botcheck"
                                            className="form-control"
                                            type="hidden"
                                            value=""
                                        /> */}
                                        <button
                                            type="submit"
                                            className="taxisafar-theme-button"
                                            disabled={formik.isSubmitting}
                                        >
                                            <span className="btn-title"> {formik.isSubmitting ? "Please Wait..." : "Update Profile"}</span>
                                        </button>

                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
