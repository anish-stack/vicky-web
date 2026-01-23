import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { createModel, updateModel } from '../core/_requests'
import { initialModel, Model, one_way_trip_pricings } from '../core/_models'
import clsx from 'clsx'
//import {PermissionQueryResponse} from '../../permission-management/core/_models'
//import { getPermissions } from '../../permission-management/core/_requests'
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap'
import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

type Props = {
  isLoading: boolean
  model: Model
  ModuleName: any
}


const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileSize', 'File is too large. Maximum size is 5MB', value => {
      return value && value.size <= 5 * 1024 * 1024;
    })
    .test('fileFormat', 'Unsupported file format. Only JPG, JPEG, and PNG are allowed', value => {
      return value && ['image/jpeg', 'image/png'].includes(value.type);
    }),
  priceperkm: Yup.number()
    .required('Price per km is required')
    .typeError('Price per km must be a valid decimal number')
    .test('valid-decimal', 'Price per km must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
    perdaystatetaxcharges: Yup.number()
    .required('Price per day is required')
    .typeError('Price per day must be a valid decimal number')
    .test('valid-decimal', 'Price per day must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  terms: Yup.string().required('Terms is required'),
  minimum_price: Yup.string().required('Minimum Price is Required!')
    .test('is-positive-integer', 'Only positive integer values are valid', (value: any) => {
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }),
  minimum_price_range: Yup.string().required('KM for Min price is Required!')
    .test('is-positive-integer', 'Only positive integer values are valid', (value: any) => {
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }),
  extra_fare_km: Yup.number()
    .required('Extra Fare Km is required')
    .typeError('Extra Fare Km must be a valid decimal number')
    .test('valid-decimal', 'Extra Fare Km must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
    additional_time_charge: Yup.number()
    .required('Additional Time Charge is required')
    .typeError('Additional Time Charge must be a valid decimal number')
    .test('valid-decimal', 'Additional Time Charge must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  
  driver_expences: Yup.number()
    .required('Driver Expenses is required')
    .typeError('Driver Expenses must be a valid decimal number')
    .test('valid-decimal', 'Driver Expenses must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  passengers: Yup.number()
    .required('Passengers is required')
    .typeError('Passengers must be a number')
    .min(0, 'Passengers must be at least 1')
    .max(20, 'Passengers must not exceed 20'),
  large_size_bag: Yup.number()
    .required('Large Size Bags is required')
    .typeError('Large Size Bags must be a number')
    .min(0, 'Large Size Bags must be at least 1')
    .max(20, 'Large Size Bags must not exceed 20'),
  medium_size_bag: Yup.number()
    .required('Medium Size Bags is required')
    .typeError('Medium Size Bags must be a number')
    .min(0, 'Medium Size Bags must be at least 1')
    .max(20, 'Medium Size Bags must not exceed 20'),
  hand_bag: Yup.number()
    .required('Hand Bags is required')
    .typeError('Hand Bags must be a number')
    .min(0, 'Hand Bags must be at least 1')
    .max(20, 'Hand Bags must not exceed 20'),
  one_way_trip_pricings: Yup.array()
    .defined()
    .of(
      Yup.object().shape({
        from: Yup.string()
          .required('From Field is Required!')
          .test('is-number', 'Only integer values are valid', (value: any) => !isNaN(value) && Number.isInteger(Number(value))),
        to: Yup.string()
          .required('To Field is Required!')
          .test('is-positive-integer', 'Only positive integer values are valid', (value: any) => {
            const num = Number(value);
            return !isNaN(num) && Number.isInteger(num) && num > 0;
          })
          .test('to-greater-than-from', 'To value must be greater than From value', function (value) {
            const from = Number(this.parent.from);
            const to = Number(value);
            if (isNaN(from) || isNaN(to)) {
              return false;
            }
            return to > from;
          }),
        price_per_km: Yup.string().required('Price Per Km Field is Required!'),
      })
    ),
});

const validationUpdateSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  image: Yup.mixed()
    .test('fileFormat', 'Unsupported file format. Only JPG, JPEG, and PNG are allowed', (value) => {
      if ((typeof value != 'undefined') && (typeof value.type != 'undefined')) {
        return value && (
          ['image/jpeg', 'image/png'].includes(value.type)
        );
      } else return true;
    })
    .test('fileSize', 'File is too large. Maximum size is 5MB', (value) => {
      if ((typeof value != 'undefined') && (typeof value.type != 'undefined')) {
        return value && (
          value.size <= 5 * 1024 * 1024
        );
      } else return true;
    }),
  priceperkm: Yup.number()
    .required('Price per km is required')
    .typeError('Price per km must be a valid decimal number')
    .test('valid-decimal', 'Price per km must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  perdaystatetaxcharges: Yup.number()
    .required('Price per day is required')
    .typeError('Price per day must be a valid decimal number')
    .test('valid-decimal', 'Price per day must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  terms: Yup.string().required('Terms is required'),
  minimum_price: Yup.string().required('Minimum Price is Required!')
    .test('is-positive-integer', 'Only positive integer values are valid', (value: any) => {
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }),
  minimum_price_range: Yup.string().required('KM for Min price is Required!')
    .test('is-positive-integer', 'Only positive integer values are valid', (value: any) => {
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }),
  extra_fare_km: Yup.number()
    .required('Extra Fare Km is required')
    .typeError('Extra Fare Km must be a valid decimal number')
    .test('valid-decimal', 'Extra Fare Km must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  driver_expences: Yup.number()
    .required('Driver Expenses is required')
    .typeError('Driver Expenses must be a valid decimal number')
    .test('valid-decimal', 'Driver Expenses must be a valid decimal number', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  passengers: Yup.number()
    .required('Passengers is required')
    .typeError('Passengers must be a number')
    .min(0, 'Passengers must be at least 1')
    .max(20, 'Passengers must not exceed 20'),
  large_size_bag: Yup.number()
    .required('Large Size Bags is required')
    .typeError('Large Size Bags must be a number')
    .min(0, 'Large Size Bags must be at least 1')
    .max(20, 'Large Size Bags must not exceed 20'),
  medium_size_bag: Yup.number()
    .required('Medium Size Bags is required')
    .typeError('Medium Size Bags must be a number')
    .min(0, 'Medium Size Bags must be at least 1')
    .max(20, 'Medium Size Bags must not exceed 20'),
  hand_bag: Yup.number()
    .required('Hand Bags is required')
    .typeError('Hand Bags must be a number')
    .min(0, 'Hand Bags must be at least 1')
    .max(20, 'Hand Bags must not exceed 20'),
  one_way_trip_pricings: Yup.array()
    .defined()
    .of(
      Yup.object().shape({
        from: Yup.string()
          .required('From Field is Required!')
          .test('is-number', 'Only integer values are valid', (value: any) => !isNaN(value) && Number.isInteger(Number(value))),
        to: Yup.string()
          .required('To Field is Required!')
          .test('is-positive-integer', 'Only positive integer values are valid', (value: any) => {
            const num = Number(value);
            return !isNaN(num) && Number.isInteger(num) && num > 0;
          })
          .test('to-greater-than-from', 'To value must be greater than From value', function (value) {
            const from = Number(this.parent.from);
            const to = Number(value);
            if (isNaN(from) || isNaN(to)) {
              return false;
            }
            return to > from;
          }),
        price_per_km: Yup.string().required('Price Per Km Field is Required!'),
      })
    ),
});


const Add: FC<Props> = ({ model, isLoading, ModuleName }) => {

  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });


  const [initialValues] = useState<Model>({
    ...model,
    title: model.title || initialModel.title,
    image: model.image || initialModel.image,
    priceperkm: model.priceperkm || initialModel.priceperkm,
    perdaystatetaxcharges: model.perdaystatetaxcharges || initialModel.perdaystatetaxcharges,
    fuelcharges: model.fuelcharges || initialModel.fuelcharges,
    drivercharges: model.drivercharges || initialModel.drivercharges,
    nightcharges: model.nightcharges || initialModel.nightcharges,
    parkingcharges: model.parkingcharges || initialModel.parkingcharges,
    terms: model.terms || initialModel.terms,
    minimum_price: model.minimum_price || initialModel.minimum_price,
    minimum_price_range: model.minimum_price_range || initialModel.minimum_price_range,
    extra_fare_km: model.extra_fare_km || initialModel.extra_fare_km,
    driver_expences: model.driver_expences || initialModel.driver_expences,
    one_way_trip_pricings: model.one_way_trip_pricings || initialModel.one_way_trip_pricings,
    one_way_trip_pricings_deleted_ids:
      model.one_way_trip_pricings_deleted_ids || initialModel.one_way_trip_pricings_deleted_ids,
    passengers: model.passengers || initialModel.passengers,
    large_size_bag: model.large_size_bag || initialModel.large_size_bag,
    medium_size_bag: model.medium_size_bag || initialModel.medium_size_bag,
    hand_bag: model.hand_bag || initialModel.hand_bag,
    ac_cab: model.ac_cab || initialModel.ac_cab,
    luggage: model.luggage || initialModel.luggage,
  })

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: model.id ? validationUpdateSchema : validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      let formData = new FormData();

      formData.append('title', values.title as string)
      formData.append('priceperkm', values.priceperkm as any)
      formData.append('perdaystatetaxcharges', values.perdaystatetaxcharges as any)
      formData.append('fuelcharges', values.fuelcharges as any)
      formData.append('drivercharges', values.drivercharges as any)
      formData.append('nightcharges', values.nightcharges as any)
      formData.append('parkingcharges', values.parkingcharges as any)
      formData.append('image', values.image as any)
      formData.append('terms', values.terms as string)
      formData.append('minimum_price', values.minimum_price as any)
      formData.append('minimum_price_range', values.minimum_price_range as any)
      formData.append('extra_fare_km', values.extra_fare_km as any)
      formData.append('additional_time_charge', values.additional_time_charge as any)
      formData.append('driver_expences', values.driver_expences as any)
      formData.append('passengers', values.passengers as any)
      formData.append('large_size_bag', values.large_size_bag as any)
      formData.append('medium_size_bag', values.medium_size_bag as any)
      formData.append('hand_bag', values.hand_bag as any)
      formData.append('ac_cab', values.ac_cab as any)
      formData.append('luggage', values.luggage as any)

      formData.append('one_way_trip_pricings', JSON.stringify(values.one_way_trip_pricings))

      try {

        if (isNotEmpty(values.id)) {
          updateModel(formData, values.id).then((response: any) => {
            if (response?.status == true) {
              setShow(true);
              setMessage(response?.message);
              console.log(response);
              setToastText({
                status: "success",
                text: response.message
              })
              setTimeout(() => {
                navigate(`/${ModuleName.slug}-management/list`);
              }, 2000);
            } else {
              setShow(true);
              setMessage(response?.message);
              setToastText({
                status: "danger",
                text: response.message
              })
            }
          });
        }
        else {
          await createModel(formData).then((response: any) => {
            if (response?.status == true) {
              setShow(true);
              setMessage(response?.message);
              console.log(response);
              setToastText({
                status: "success",
                text: response.message
              })
              setTimeout(() => {
                navigate(`/${ModuleName.slug}-management/list`);
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
          });
        }
      } catch (error) {

      }
    }
  });

  const [deletePricingRangeList, setdeletePricingRangeList] = useState<Array<ID>>([])

  const handleaddpricingrangeclick = () => {
    const lastIndex = formik.values.one_way_trip_pricings.length - 1;
    const lastToValue = formik.values.one_way_trip_pricings[lastIndex]?.to as any;

    formik.setFieldValue('one_way_trip_pricings', [
      ...formik.values.one_way_trip_pricings,
      {
        vehicle_id: 0 as number,
        from: lastToValue ? (parseInt(lastToValue) + 1).toString() : 0,
        to: '',
        price_per_km: '',
      },
    ]);
  };

  const handlePricingrangeremove = (index: any) => {
    const updatedPricingRanges = formik.values.one_way_trip_pricings.filter(
      (_, idx) => idx !== index
    ) as any;

    formik.setFieldValue('one_way_trip_pricings', updatedPricingRanges);

    updatedPricingRanges.forEach((pricing: any, idx: any) => {
      if (idx > 0) {
        formik.setFieldValue(`one_way_trip_pricings.[${idx}].from`, (parseInt(updatedPricingRanges[idx - 1].to) + 1).toString());
      } else if (idx === 0) {
        formik.setFieldValue(`one_way_trip_pricings[${idx}].from`, (parseInt(formik.values.minimum_price_range as any) + 1).toString());
      }
    });
  };


  const handleChange = (value: any) => {
    setShow(value);
  }

  const editorConfiguration = {
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' }
      ],
    },
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'strapiMediaLib',
      'Blockquote',
      '|',
      'undo',
      'redo',
    ],
    placeholder: 'Type the content here!',
    language: 'en',
    licenseKey: '',
  }

  const blankImg = `${process.env.REACT_APP_BACKEND_BASE_URL}/profilepic/default.jpg`;
  const [avatarImg, setAvatarImg] = useState(`${process.env.REACT_APP_BACKEND_BASE_URL}/vehicle/${formik.values.image}`);
  return (
    <>

      <KTCard className='w-100 '>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>
          <form id={`add_${ModuleName.slug}_form`} className='form' onSubmit={formik.handleSubmit}>
            <div className="row row-cols-1">
              <div className="col">
                <div className='fv-row mb-7'>

                  <label className='d-block fw-semibold fs-6 mb-5'>Image</label>
                  <div className='image-input image-input-empty image-input-outline' data-kt-image-input='true' style={{ backgroundImage: `url('${blankImg}')` }}>

                    <div className='image-input-wrapper w-125px h-125px' style={{ backgroundImage: `url('${avatarImg}')` }}></div>
                    <label className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow' data-kt-image-input-action='change' data-bs-toggle='tooltip' title='Change avatar'>

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
                    </label>

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
            </div>

            <div className='row row-cols-5'>
              <div className="col-4">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Title`}</label>
                  <input placeholder={`Title`}
                    {...formik.getFieldProps('title')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.title && formik.errors.title },
                      {
                        'is-valid': formik.touched.title && !formik.errors.title,
                      }
                    )}
                    type='text' name='title' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.title && formik.errors.title && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.title}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Extra fare/km`}</label>
                  <input placeholder={`Extra fare/km`}
                    {...formik.getFieldProps('extra_fare_km')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.extra_fare_km && formik.errors.extra_fare_km },
                      {
                        'is-valid': formik.touched.extra_fare_km && !formik.errors.extra_fare_km,
                      }
                    )}
                    type='text' name='extra_fare_km' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.extra_fare_km && formik.errors.extra_fare_km && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.extra_fare_km}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Additional Time Charge/H`}</label>
                  <input placeholder={`Additional Time Charges/Hour`}
                    {...formik.getFieldProps('additional_time_charge')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.additional_time_charge && formik.errors.additional_time_charge },
                      {
                        'is-valid': formik.touched.additional_time_charge && !formik.errors.additional_time_charge,
                      }
                    )}
                    type='text' name='additional_time_charge' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.additional_time_charge && formik.errors.additional_time_charge && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.additional_time_charge}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Driver Expenses`}</label>
                  <input placeholder={'Driver Expenses'}
                    {...formik.getFieldProps('driver_expences')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.driver_expences && formik.errors.driver_expences },
                      {
                        'is-valid': formik.touched.driver_expences && !formik.errors.driver_expences,
                      }
                    )}
                    type='text' name='driver_expences' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.driver_expences && formik.errors.driver_expences && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.driver_expences}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>Price Per KM For Round Trip</label>
                  <input placeholder="Price Per KM"
                    {...formik.getFieldProps('priceperkm')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.priceperkm && formik.errors.priceperkm },
                      {
                        'is-valid': formik.touched.priceperkm && !formik.errors.priceperkm,
                      }
                    )}
                    type='text' name='priceperkm' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.priceperkm && formik.errors.priceperkm && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.priceperkm}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>State Tax/Day For Round Trip</label>
                  <input placeholder="Price Per KM"
                    {...formik.getFieldProps('perdaystatetaxcharges')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.perdaystatetaxcharges && formik.errors.perdaystatetaxcharges },
                      {
                        'is-valid': formik.touched.perdaystatetaxcharges && !formik.errors.perdaystatetaxcharges,
                      }
                    )}
                    type='text' name='perdaystatetaxcharges' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.perdaystatetaxcharges && formik.errors.perdaystatetaxcharges && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.perdaystatetaxcharges}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='row row-cols-1'>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>Terms</label>
                  <CKEditor
                    {...formik.getFieldProps('terms')}
                    editor={ClassicEditor as any}
                    config={editorConfiguration as any}
                    data={initialValues.terms}
                    onChange={(event, editor: any) => {
                      const data = editor.getData()
                      formik.setFieldValue('terms', editor.getData())
                    }}
                    onBlur={(event, editor) => {
                      console.log('Blur.', editor)
                    }}
                  />

                  {formik.touched.terms && formik.errors.terms && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.terms}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>



            <div className="row row-cols-4">
              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-2">{`Fuel Charges`}</label>

                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="fuelchargesYes"
                        name="fuelcharges"
                        value="true"
                        checked={formik.values.fuelcharges === true}
                        onChange={() => formik.setFieldValue('fuelcharges', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="fuelchargesYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="fuelchargesNo"
                        name="fuelcharges"
                        value="false"
                        checked={formik.values.fuelcharges === false}
                        onChange={() => formik.setFieldValue('fuelcharges', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="fuelchargesNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.fuelcharges && formik.errors.fuelcharges && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.fuelcharges}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-2">{`Driver Charges`}</label>

                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="driverchargesYes"
                        name="drivercharges"
                        value="true"
                        checked={formik.values.drivercharges === true}
                        onChange={() => formik.setFieldValue('drivercharges', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="driverchargesYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="driverchargesNo"
                        name="drivercharges"
                        value="false"
                        checked={formik.values.drivercharges === false}
                        onChange={() => formik.setFieldValue('drivercharges', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="driverchargesNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.drivercharges && formik.errors.drivercharges && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.drivercharges}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-2">{`Night Charges`}</label>

                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="nightchargesYes"
                        name="nightcharges"
                        value="true"
                        checked={formik.values.nightcharges === true}
                        onChange={() => formik.setFieldValue('nightcharges', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="nightchargesYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="nightchargesNo"
                        name="nightcharges"
                        value="false"
                        checked={formik.values.nightcharges === false}
                        onChange={() => formik.setFieldValue('nightcharges', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="nightchargesNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.nightcharges && formik.errors.nightcharges && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.nightcharges}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-2">{`Parking Charges`}</label>

                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="parkingchargesYes"
                        name="parkingcharges"
                        value="true"
                        checked={formik.values.parkingcharges === true}
                        onChange={() => formik.setFieldValue('parkingcharges', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="parkingchargesYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="parkingchargesNo"
                        name="parkingcharges"
                        value="false"
                        checked={formik.values.parkingcharges === false}
                        onChange={() => formik.setFieldValue('parkingcharges', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="parkingchargesNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.parkingcharges && formik.errors.parkingcharges && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.parkingcharges}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className='row row-cols-6'>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Passengers`}</label>
                  <input placeholder={`Passengers`}
                    {...formik.getFieldProps('passengers')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.passengers && formik.errors.passengers },
                      {
                        'is-valid': formik.touched.passengers && !formik.errors.passengers,
                      }
                    )}
                    type='text' name='passengers' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.passengers && formik.errors.passengers && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.passengers}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Large Size Bags`}</label>
                  <input placeholder={`Large Size Bags`}
                    {...formik.getFieldProps('large_size_bag')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.large_size_bag && formik.errors.large_size_bag },
                      {
                        'is-valid': formik.touched.large_size_bag && !formik.errors.large_size_bag,
                      }
                    )}
                    type='text' name='large_size_bag' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.large_size_bag && formik.errors.large_size_bag && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.large_size_bag}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Medium Size Bags`}</label>
                  <input placeholder={'Medium Size Bags'}
                    {...formik.getFieldProps('medium_size_bag')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.medium_size_bag && formik.errors.medium_size_bag },
                      {
                        'is-valid': formik.touched.medium_size_bag && !formik.errors.medium_size_bag,
                      }
                    )}
                    type='text' name='medium_size_bag' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.medium_size_bag && formik.errors.medium_size_bag && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.medium_size_bag}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Hand Bags`}</label>
                  <input placeholder={'Hand Bags'}
                    {...formik.getFieldProps('hand_bag')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.hand_bag && formik.errors.hand_bag },
                      {
                        'is-valid': formik.touched.hand_bag && !formik.errors.hand_bag,
                      }
                    )}
                    type='text' name='hand_bag' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.hand_bag && formik.errors.hand_bag && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.hand_bag}</span>
                    </div>
                  )}
                </div>
              </div>


              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-5">{`AC Cab`}</label>

                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="ac_cabYes"
                        name="ac_cab"
                        value="true"
                        checked={formik.values.ac_cab === true}
                        onChange={() => formik.setFieldValue('ac_cab', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="ac_cabYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="ac_cabNo"
                        name="ac_cab"
                        value="false"
                        checked={formik.values.ac_cab === false}
                        onChange={() => formik.setFieldValue('ac_cab', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="ac_cabNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.ac_cab && formik.errors.ac_cab && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.ac_cab}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-5">{`Luggage`}</label>

                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="luggageYes"
                        name="luggage"
                        value="true"
                        checked={formik.values.luggage === true}
                        onChange={() => formik.setFieldValue('luggage', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="luggageYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="luggageNo"
                        name="luggage"
                        value="false"
                        checked={formik.values.luggage === false}
                        onChange={() => formik.setFieldValue('luggage', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="luggageNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.luggage && formik.errors.luggage && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.luggage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='custom-cms-card'>
              <div className="heading">
                <h3 className="m-0">
                  {`One Way Trip Pricing`}
                </h3>
              </div>

              <div className='content'>
                <div className='row row-col-2'>
                  <div className='col'>
                    <div className="col">
                      <div className='fv-row mb-7'>
                        <label className='required fw-semibold fs-6 mb-2'>{`Minimum Price`}</label>
                        <input placeholder={`Minimum Price`}
                          {...formik.getFieldProps('minimum_price')}
                          className={clsx(
                            'form-control form-control-solid mb-3 mb-lg-0',
                            { 'is-invalid': formik.touched.minimum_price && formik.errors.minimum_price },
                            {
                              'is-valid': formik.touched.minimum_price && !formik.errors.minimum_price,
                            }
                          )}
                          type='number' name='minimum_price' autoComplete='off' disabled={formik.isSubmitting} />

                        {formik.touched.minimum_price && formik.errors.minimum_price && (
                          <div className='fv-plugins-message-container'>
                            <span className='text-danger' role='alert'>{formik.errors.minimum_price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='col'>
                    <div className="col">
                      <div className='fv-row mb-7'>
                        <label className='required fw-semibold fs-6 mb-2'>{`KM for Min price`}</label>
                        <input placeholder={`KM for Min price`}
                          {...formik.getFieldProps('minimum_price_range')}
                          onChange={(e) => {
                            formik.handleChange(e);
                            if (formik.values.one_way_trip_pricings.length > 0) {
                              // const nextIndex = index + 1;
                              formik.setFieldValue(
                                `one_way_trip_pricings.[0].from`,
                                (parseInt(e.target.value) + 1)
                              );
                            }
                          }}
                          className={clsx(
                            'form-control form-control-solid mb-3 mb-lg-0',
                            { 'is-invalid': formik.touched.minimum_price_range && formik.errors.minimum_price_range },
                            {
                              'is-valid': formik.touched.minimum_price_range && !formik.errors.minimum_price_range,
                            }
                          )}
                          type='number' name='minimum_price_range' autoComplete='off' disabled={formik.isSubmitting} />

                        {formik.touched.minimum_price_range && formik.errors.minimum_price_range && (
                          <div className='fv-plugins-message-container'>
                            <span className='text-danger' role='alert'>{formik.errors.minimum_price_range}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type='hidden'
                  name='one_way_trip_pricings_deleted_ids'
                  autoComplete='off'
                  value={deletePricingRangeList as any}
                  disabled={formik.isSubmitting}
                  onChange={(value: any) => {
                    formik.setFieldValue('one_way_trip_pricings_deleted_ids', value)
                  }}
                />

                <div className='row row-cols-3 g-2'>
                  {formik.values.one_way_trip_pricings.map((pageObj: any, index: any) => {
                    return (
                      <div key={`one_way_trip_pricings.${index}.id`} className='mt-2' >
                        <div className='property-faq position-relative'>
                          {formik.values.one_way_trip_pricings.length > 1 && (
                            <div
                              className='delete-button bi bi-trash-fill'
                              onClick={() => handlePricingrangeremove(index)}
                            >
                            </div>
                          )}

                          <div className='row row-cols-3'>
                            <div className='col'>
                              <label className='required fw-semibold fs-6 mb-2'>From</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='From'
                                  value={formik.values.one_way_trip_pricings[index].from}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='number'
                                  autoComplete='off'
                                  disabled={true}
                                  onBlur={(e) => formik.handleBlur(e)}
                                />
                              </div>

                            </div>

                            <div className='col'>
                              <label className='required fw-semibold fs-6 mb-2'>To</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='To'
                                  {...formik.getFieldProps(`one_way_trip_pricings.[${index}].to`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='number'
                                  autoComplete='off'
                                  disabled={formik.isSubmitting}
                                  onBlur={(e) => formik.handleBlur(e)}
                                  onChange={(e) => {
                                    formik.handleChange(e);
                                    if (index < formik.values.one_way_trip_pricings.length - 1) {
                                      const nextIndex = index + 1;
                                      formik.setFieldValue(
                                        `one_way_trip_pricings.[${nextIndex}].from`,
                                        (parseInt(e.target.value) + 1).toString()
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            <div className='col'>
                              <label className='required fw-semibold fs-6 mb-2'>Price/Km</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='Price/Km'
                                  {...formik.getFieldProps(`one_way_trip_pricings.[${index}].price_per_km`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='text'
                                  autoComplete='off'
                                  disabled={formik.isSubmitting}
                                  onBlur={(e) => formik.handleBlur(e)}
                                />
                              </div>
                            </div>

                          </div>
                          {formik.touched.one_way_trip_pricings &&
                            formik.touched.one_way_trip_pricings[index] &&
                            formik.touched.one_way_trip_pricings[index].from &&
                            formik.touched.one_way_trip_pricings[index].from === true &&
                            (formik.errors.one_way_trip_pricings?.[index] as one_way_trip_pricings)?.from && (
                              <div className='fv-plugins-message-container'>
                                <span className='text-danger' role='alert'>
                                  {(formik.errors.one_way_trip_pricings?.[index] as one_way_trip_pricings)?.from}
                                </span>
                              </div>
                            )}
                          {formik.touched.one_way_trip_pricings &&
                            formik.touched.one_way_trip_pricings[index] &&
                            formik.touched.one_way_trip_pricings[index].to &&
                            formik.touched.one_way_trip_pricings[index].to === true &&
                            (formik.errors.one_way_trip_pricings?.[index] as one_way_trip_pricings)?.to && (
                              <div className='fv-plugins-message-container'>
                                <span className='text-danger' role='alert'>
                                  {(formik.errors.one_way_trip_pricings?.[index] as one_way_trip_pricings)?.to}
                                </span>
                              </div>
                            )}
                          {formik.touched.one_way_trip_pricings &&
                            formik.touched.one_way_trip_pricings[index] &&
                            formik.touched.one_way_trip_pricings[index].price_per_km &&
                            formik.touched.one_way_trip_pricings[index].price_per_km === true &&
                            (formik.errors.one_way_trip_pricings?.[index] as one_way_trip_pricings)?.price_per_km && (
                              <div className='fv-plugins-message-container'>
                                <span className='text-danger' role='alert'>
                                  {(formik.errors.one_way_trip_pricings?.[index] as one_way_trip_pricings)?.price_per_km}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className='col mt-4'>
                  <div>
                    <span
                      style={{ fontSize: "15px", fontWeight: "bold", color: "var(--common-theme-color)" }}
                      onClick={handleaddpricingrangeclick}
                      className='cursor-pointer'
                    >
                      + Add More Pricing Range
                    </span>
                  </div>
                </div>

              </div>
            </div>




            <div className="row row-cols-1">
              <div className='text-center pt-15'>
                <input  {...formik.getFieldProps('id')} type="hidden" name="id" />
                <button
                  type='submit'
                  className='btn btn-primary'
                  data-kt-users-modal-action='submit'
                  disabled={formik.isSubmitting}
                >
                  <span className='indicator-label'>Submit</span>
                  {(formik.isSubmitting) && (
                    <span className='indicator-progress'>
                      Please wait...{' '}
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </KTCardBody>
      </KTCard>
    </>
  )

}

export { Add }
