import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty } from '../../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { ChangeUserPWD, createUser, updateUser } from '../core/_requests'
import { initialUser, User } from '../core/_models'
import clsx from 'clsx'
import { UsersListLoading } from './components/loading/UsersListLoading'
import { ToastComponent } from '../../../../../_metronic/helpers/components/ToastComponent'
import { useNavigate } from 'react-router-dom';
import { CustomSelect } from './select-react/CustomSelect'
import { Modal, Button } from "react-bootstrap";

type Props = {
  isUserLoading: boolean
  user: User
}

const UserAdd: FC<Props> = ({ user, isUserLoading }) => {

  const UserValidation = Yup.object().shape({
    name: Yup.string().required('Name is required').max(50, "Name Should be Less than 50 Character"),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(20, 'Password cannot exceed 20 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  })

  const UserValidationWihoutPwd = Yup.object().shape({
    name: Yup.string().required('Name is required').max(50, "Name Should be Less than 50 Character"),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    // password: Yup.string().required('Password is required')
  })

  const OnlyUserPwd = Yup.object().shape({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(20, 'Password cannot exceed 20 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  })

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });
  const navigate = useNavigate();


  const [userValues] = useState<User>({
    ...user,
    name: user.name || initialUser.name,
    email: user.email || initialUser.email,
    image: user.image || initialUser.image,
    address: user.address || initialUser.address,
    city: user.city || initialUser.city,
    pin_code: user.pin_code || initialUser.pin_code,
    gender: user.gender || initialUser.gender,
    phone_number: user.phone_number || initialUser.phone_number,
  })

  const [userPassValues] = useState<User>({
    ...user,
    // password: user.password || initialUser.password,
  })


  const formik = useFormik({
    initialValues: userValues,
    validationSchema: user.id ? UserValidationWihoutPwd : UserValidation,
    onSubmit: async (values, { setSubmitting }) => {

      setSubmitting(true);

      let formData = new FormData();

      // formData.append('name', values.name as any)
      // formData.append('email', values.email as any)
      // if (!user.id) {
      //   formData.append('password', values.password as any);
      // }

      try {
        if (isNotEmpty(values.id)) {
          await updateUser(formData, values.id).then((response: any) => {
            console.log('error333', response);
            if (response?.status == true) {
              setShow(true);
              setToastText({
                status: "success",
                text: response.message
              })
              setMessage(response?.message);
              setTimeout(() => {
                navigate('/apps/driver-management/list');
              }, 2000);
            }
            else {
              console.log('error123', response.message);
              setShow(true);
              setMessage(response?.message);
              setToastText({
                status: "danger",
                text: response?.message
              })
            }
          })

        } else {
          console.log(values);
          await createUser(formData).then((response: any) => {
            if (response?.status == true) {
              setShow(true);
              setToastText({
                status: "success",
                text: response.message
              })
              setMessage(response?.message);
              setTimeout(() => {
                navigate('/apps/driver-management/list');
              }, 2000);
            }
            else {
              setShow(true);
              setMessage(response?.message);
              setToastText({
                status: "danger",
                text: response?.message
              })
            }
          })

        }
      } catch (ex) {
        console.error(ex)
      } finally {
        setSubmitting(true)
      }

    },
  });

  const formikPassChange = useFormik({
    initialValues: userPassValues,
    validationSchema: OnlyUserPwd,
    onSubmit: async (values, { setSubmitting, resetForm }) => {

      setSubmitting(true);

      let formData = new FormData();

      formData.append('password', values.password as any);

      try {
        if (isNotEmpty(values.id)) {
          formData.append('_method', 'PUT')
          await ChangeUserPWD(formData, values.id).then((response: any) => {
            if (response?.status == true) {
              setShow(true);
              setToastText({
                status: "success",
                text: response.message
              })
              setMessage(response?.message);
              handleClose();
              resetForm({
                values: {
                  ...values,
                  password: '',
                },
              });
            }
            else {
              setShow(true);
              setMessage(response?.message);
              setToastText({
                status: "danger",
                text: response?.message
              })
            }
          })
        }
      } catch (ex) {
        console.error(ex)
      } finally {
        setSubmitting(true)
      }
    },
  });


  const handleChange = (value: any) => {
    setShow(value);
  }


  const RoleItems = [
    { label: "ADMIN", value: "admin" },
    { label: "DATA ENTRY OPERATOR", value: "data_entry_operator" },
  ];

  const [resetPassShow, setResetPassShow] = useState(false);

  const handleShow = () => setResetPassShow(true);
  const handleClose = () => setResetPassShow(false);

  const blankImg = `${process.env.REACT_APP_BACKEND_BASE_URL}/profilepic/default.jpg`;
  const [avatarImg, setAvatarImg] = useState(`${process.env.REACT_APP_BACKEND_BASE_URL}/users/${formik.values.image}`);

  return (
    <>
      <KTCard className='w-100'>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />

        <KTCardBody>
          <div>

            <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit}>

              <div className="row row-cols-1">
                <div className="col">
                  <div className='fv-row mb-7'>

                    <label className='d-block fw-semibold fs-6 mb-5'>Profile Pic</label>
                    <div className='image-input image-input-empty image-input-outline' data-kt-image-input='true' style={{ backgroundImage: `url('${blankImg}')` }}>

                      <div className='image-input-wrapper w-125px h-125px' style={{ backgroundImage: `url('${avatarImg}')` }}></div>
                      {/* <label className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow' data-kt-image-input-action='change' data-bs-toggle='tooltip' title='Change avatar'>

                      <i className='bi bi-pencil-fill fs-7'></i>
                      <input onChange={(event) => {
                        if (event.currentTarget.files) {
                          formik.setFieldValue(
                            "image",
                            event.currentTarget.files[0]
                          );
                        }
                        const fileReader = new FileReader();
                        fileReader.onload = () => {
                          if (fileReader.readyState === 2) {
                            setAvatarImg(fileReader.result as any);
                          }
                        };
                        if (event.target.files?.[0]) {
                          fileReader.readAsDataURL(event.target.files[0]);
                        }
                      }}
                        type='file' accept='.png, .jpg, .jpeg' />
                    </label> */}

                      <span className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow' data-kt-image-input-action='cancel' data-bs-toggle='tooltip' title='Cancel avatar'>
                        <i className='bi bi-x fs-2'></i>
                      </span>

                      <span className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow' data-kt-image-input-action='remove' data-bs-toggle='tooltip' title='Remove avatar'>
                        <i className='bi bi-x fs-2'></i>
                      </span>

                    </div>
                    <div className='form-text'>Allowed file types: png, jpg, jpeg.</div>

                    {formik.touched.image &&
                      formik.errors.image && (
                        <div className="fv-plugins-message-container">
                          <span className="text-danger" role="alert">
                            {formik.errors.image as any}
                          </span>
                        </div>
                      )}

                  </div>
                </div>


                {/* {user.id ?
                  "" :
                  <div className="col">
                    <div className='fv-row mb-7'>
                      <label className='fw-semibold fs-6 mb-2'>Password</label>
                      <input placeholder='Password'
                        {...formik.getFieldProps('password')}
                        className={clsx(
                          'form-control form-control-solid mb-3 mb-lg-0',
                          { 'is-invalid': formik.touched.password && formik.errors.password },
                          {
                            'is-valid': formik.touched.password && !formik.errors.password,
                          }
                        )}
                        type='password' name='password' autoComplete='off' disabled={true} />

                      {formik.touched.password && formik.errors.password && (
                        <div className='fv-plugins-message-container'>
                          <span className='text-danger' role='alert'>{formik.errors.password}</span>
                        </div>
                      )}
                    </div>
                  </div>
                } */}

              </div>

              <div className='row row-cols-2'>
                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='fw-semibold fs-6 mb-2'>Name</label>
                    <input placeholder='Name'
                      {...formik.getFieldProps('name')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.name && formik.errors.name },
                        {
                          'is-valid': formik.touched.name && !formik.errors.name,
                        }
                      )}
                      type='text' name='name' autoComplete='off' disabled={true} />

                    {formik.touched.name && formik.errors.name && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='fw-semibold fs-6 mb-2'>Phone Number</label>
                    <input placeholder='Phone Number'
                      {...formik.getFieldProps('phone_number')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.phone_number && formik.errors.phone_number },
                        {
                          'is-valid': formik.touched.phone_number && !formik.errors.phone_number,
                        }
                      )}
                      type='phone_number' name='phone_number' autoComplete='off' disabled={true} />

                    {formik.touched.phone_number && formik.errors.phone_number && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='row row-cols-3'>
                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='fw-semibold fs-6 mb-2'>Address</label>
                    <input placeholder='Address'
                      {...formik.getFieldProps('address')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.address && formik.errors.address },
                        {
                          'is-valid': formik.touched.address && !formik.errors.address,
                        }
                      )}
                      type='text' name='address' autoComplete='off' disabled={true} />

                    {formik.touched.name && formik.errors.address && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='fw-semibold fs-6 mb-2'>City</label>
                    <input placeholder='City'
                      {...formik.getFieldProps('city')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.city && formik.errors.city },
                        {
                          'is-valid': formik.touched.city && !formik.errors.city,
                        }
                      )}
                      type='city' name='city' autoComplete='off' disabled={true} />

                    {formik.touched.city && formik.errors.city && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='fw-semibold fs-6 mb-2'>Pincode</label>
                    <input placeholder='Pincode'
                      {...formik.getFieldProps('pin_code')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.pin_code && formik.errors.pin_code },
                        {
                          'is-valid': formik.touched.pin_code && !formik.errors.pin_code,
                        }
                      )}
                      type='pin_code' name='pin_code' autoComplete='off' disabled={true} />

                    {formik.touched.pin_code && formik.errors.pin_code && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.pin_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </KTCardBody>
      </KTCard>

      {(formik.isSubmitting || isUserLoading) && <UsersListLoading />}
    </>
  )


}

export { UserAdd }
