import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Toast, ToastContainer } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useRouter } from 'next/router';
import { getCustomerDetail, updateCustomerProfile } from '@/pages/api/customer';

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [toastShow, setToastShow] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [toastSuccessShow, setToastSuccessShow] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone_number: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').max(25, 'Too long'),
      // email: Yup.string().email('Invalid email address').required('Email is required'),
      // phone_number: Yup.string()
      //   .required('Phone number is required')
      //   .min(5, 'Too short')
      //   .max(15, 'Too long'),
    }),
    onSubmit: async (values) => {
      try {
        NProgress.start();
        const response = await updateCustomerProfile(values); // API call

        if (response?.status === true) {
          setToastSuccessShow(true);
          setSuccessMessage(response?.message || 'Profile updated successfully');
        } else {
          setToastShow(true);
          setMessage(response?.message || 'Failed to update profile');
        }

        NProgress.done();
      } catch (error) {
        setToastShow(true);
        setMessage('Something went wrong');
        NProgress.done();
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCustomerDetail(); // Fetch existing data
        if (res?.status === true) {
          formik.setValues({
            name: res.data.name || '',
            email: res.data.email || '',
            phone_number: res.data.phone_number || '',
          });
        }
      } catch (err) {
        console.error(err);
        setToastShow(true);
        setMessage('Failed to load profile');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (message || successMessage) {
      const timer = setTimeout(() => {
        setMessage('');
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, successMessage]);
  

  if (initialLoading) return <p>Loading...</p>;
  

  return (
    <>
      {/* Toast Messages */}
      {/* <ToastContainer className="toast-container-custom">
        <Toast onClose={() => setToastShow(false)} show={toastShow} delay={3000} autohide className="bg-danger text-white">
          <Toast.Header>
            <strong className="me-auto">Error</strong>
            <small>Now</small>
          </Toast.Header>
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <ToastContainer className="toast-container-custom">
        <Toast onClose={() => setToastSuccessShow(false)} show={toastSuccessShow} delay={3000} autohide className="bg-success text-white">
          <Toast.Header>
            <strong className="me-auto">Success</strong>
            <small>Now</small>
          </Toast.Header>
          <Toast.Body>{successMessage}</Toast.Body>
        </Toast>
      </ToastContainer> */}

      {/* Edit Profile Form */}
      <div className="banner-one-form signin-form mt-5 mx-auto">
        <h3 className="form-title mb-0">Edit Profile</h3>
        
        <form className="form" onSubmit={formik.handleSubmit}>
          <div className="trip-options">
            <div className='mx-0'>
              {message && (
                <div className="text-danger text-start p-0 mb-0" role="alert">
                  {message}
                </div>
              )}

              {successMessage && (
                <div className="text-success text-start p-0 mb-0" role="alert">
                  {successMessage}
                </div>
              )}
              <div className=" p-2" role="alert">
              </div>
            </div>
            <div className="mt-0 custom-input position-relative">
              <input
                type="text"
                placeholder="Name"
                name="name"
                className="custom-text-input"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <i className="icon fa-regular fa-user position-absolute" style={{ right: '30px', top: '50%', transform: 'translateY(-50%)' }}></i>
              {formik.touched.name && formik.errors.name && (
                <p className="text-danger text-start mb-0 error-message">{formik.errors.name}</p>
              )}
            </div>

            {/* <div className="mt-3 custom-input position-relative">
              <input
                type="email"
                placeholder="Email"
                name="email"
                className="custom-text-input"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <i className="icon fa-regular fa-envelope position-absolute" style={{ right: '30px', top: '50%', transform: 'translateY(-50%)' }}></i>
              {formik.touched.email && formik.errors.email && (
                <p className="text-danger text-start mb-0 error-message">{formik.errors.email}</p>
              )}
            </div> */}

            {/* <div className="mt-3 custom-input position-relative">
              <PhoneInput
                placeholder="Phone Number"
                defaultCountry="IN"
                value={formik.values.phone_number}
                onChange={(value) => formik.setFieldValue('phone_number', value)}
                onBlur={formik.handleBlur}
              />
              <i className="icon fa-regular fa-phone-volume position-absolute" style={{ right: '30px', top: '50%', transform: 'translateY(-50%)' }}></i>
              {formik.touched.phone_number && formik.errors.phone_number && (
                <p className="text-danger text-start mb-0 error-message">{formik.errors.phone_number}</p>
              )}
            </div> */}
            

            <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
              <button type="submit" className="taxisafar-theme-button w-100" disabled={formik.isSubmitting}>
                <span className="btn-title">{formik.isSubmitting ? 'Updating...' : 'Update Profile'}</span>
              </button>
            </div>
            
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
