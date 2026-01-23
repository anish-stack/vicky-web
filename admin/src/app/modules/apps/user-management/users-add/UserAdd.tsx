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
    password: user.password || initialUser.password,
  })

  const [userPassValues] = useState<User>({
    ...user,
    password: user.password || initialUser.password,
  })


  const formik = useFormik({
    initialValues: userValues,
    validationSchema: user.id ? UserValidationWihoutPwd : UserValidation,
    onSubmit: async (values, { setSubmitting }) => {

      setSubmitting(true);

      let formData = new FormData();

      formData.append('name', values.name as any)
      formData.append('email', values.email as any)
      if (!user.id) {
        formData.append('password', values.password as any);
      }

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
                navigate('/apps/user-management/list');
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
                navigate('/apps/user-management/list');
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

  return (
    <>
      <KTCard className='w-50 offset-md-3'>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />

        <KTCardBody>
          <div>

            <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit}>

              <div className="row row-cols-1">

                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='required fw-semibold fs-6 mb-2'>Name</label>
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
                    <label className='required fw-semibold fs-6 mb-2'>Phone Number</label>
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

                {user.id ?
                  "" :
                  <div className="col">
                    <div className='fv-row mb-7'>
                      <label className='required fw-semibold fs-6 mb-2'>Password</label>
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
                }

              </div>

              {/* <div className="row d-flex justify-content-center">
                <div className="d-flex justify-content-center gap-3">
                  <input {...formik.getFieldProps('id')} type="hidden" name="id" />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-kt-users-modal-action="submit"
                    disabled={formik.isSubmitting}
                  >
                    <span className="indicator-label">Submit</span>
                    {formik.isSubmitting && (
                      <span className="indicator-progress">
                        Please wait...{' '}
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    )}
                  </button>
                </div>
              </div> */}
            </form>
          </div>
        </KTCardBody>
      </KTCard>

      {(formik.isSubmitting || isUserLoading) && <UsersListLoading />}
    </>
  )


}

export { UserAdd }
