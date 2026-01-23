import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { createModel, updateBookingLimitsModel } from '../core/_requests'
import { initialBookingLimitsModel, BookingLimitsModel } from '../core/_models'
import clsx from 'clsx'

import { useNavigate } from 'react-router-dom';

import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'

import { CustomSelect } from './select-react/CustomSelect'
import { getModels as getVehicles } from '../../vehicle-management/core/_requests'
import DateTimePicker from 'react-datetime-picker'


type Props = {
  isLoading: boolean
    model:BookingLimitsModel
  ModuleName: any
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('City name is required'),
  // airport_id: Yup.string().required('Please Select Airport'),
  distance: Yup.string().required('Distance is required')
    .typeError('Use the number only')
    .test('valid-decimal', 'Use the number only', value => {
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
    }),
  booking_limits: Yup.array()
    .defined()
    .of(
      Yup.object().shape({

        max_limit: Yup.string()
          .required('Please Enter Area').max(100, "Enter less character"),
        vehicle_id: Yup.number()
          .required('Vehicle is required')
          .min(1, "Vehicle is required"),
         
      })
    )
    .test('unique-pincode', function (values) {
      if (!values) return true;

      const seen = new Map<string, number>(); // key: pincode, value: index

      for (let i = 0; i < values.length; i++) {
        const { pincode } = values[i];

        if (pincode) {
          if (seen.has(pincode)) {
            // Duplicate found — show error at the duplicate pincode field
            return this.createError({
              path: `Pincodes[${i}].pincode`, // target the field at this index
              message: 'Duplicate Pincode is not allowed',
            });
          }
          seen.set(pincode, i);
        }
      }

      return true;
    })


});

const Add: FC<Props> = ({ model, isLoading, ModuleName }) => {
  console.log("model Add", model)

  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });


    const [initialValues] = useState<BookingLimitsModel>({
        ...model,
      booking_limits: model.booking_limits || initialBookingLimitsModel.booking_limits
    })


    const [vehicle, setVehicle] = useState() as any;
    const [vehicleLoading, setVehicleLoading] = useState(true);
  
    useEffect(() => {
      (async () => {
        await getVehicles('').then((result: any) => {
          setVehicle(result);
          setVehicleLoading(false);
        });
      })();
    }, []);

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {

      try {

        if (isNotEmpty(values.id)) {
          updateBookingLimitsModel(values, values.id).then((response: any) => {
            if (response?.status == true) {
              setShow(true);
              setMessage(response?.message);
              console.log(response);
              setToastText({
                status: "success",
                text: response.message
              })
              setTimeout(() => {
                navigate(`/city-management/list`);
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
          await createModel(values).then((response: any) => {
            if (response?.status == true) {
              setShow(true);
              setMessage(response?.message);
              console.log(response);
              setToastText({
                status: "success",
                text: response.message
              })
              setTimeout(() => {
                navigate(`/city-management/list`);
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

  const handleChange = (value: any) => {
    setShow(value);
  }
  const handleremove = (index: any) => {
      const updated = formik.values.booking_limits?.filter(
      (_, idx) => idx !== index
    ) as any;

      formik.setFieldValue('booking_limits', updated);
  };

  const handleaddclick = () => {

      formik.setFieldValue('booking_limits', [
        ...formik.values.booking_limits as any,
      {
        vehicle_id: 0,
        // limit_date: '',
        max_limit: 0,
      },
    ]);
  };

  console.log("formik.values.booking_limits", formik.values.booking_limits)

  return (
    <>

      <KTCard className='card'>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>
          <form id={`add_${ModuleName.slug}_form`} className='form' onSubmit={formik.handleSubmit}>
           
            <div className='row row-cols-3'>
             

            


            </div>
            <div className='custom-cms-card mt-2'>
              <div className="heading">
                <h3 className="m-0">
                  {`Add the Maximum Booking Limit`}
                </h3>
              </div>

              <div className='content'>
                <div className='row row-cols-lg-2 row-cols-lg-2 g-3'>
                  {formik.values.booking_limits?.map((limitObj: any, index: any) => {
                    return (
                      <div key={`pricing.${index}.id`} className='mt-2' >
                        <div className='property-faq position-relative'>
                                {formik.values.booking_limits && formik.values.booking_limits.length > 1 && (
                            <div
                              className='delete-button bi bi-trash-fill'
                              onClick={() => handleremove(index)}
                            >
                            </div>
                          )}
                          <div className='row row-cols-3'>


                            <div className='col-5'>
                              <label className='required fw-semibold fs-6 mb-2'>Vehicle </label>
                              <div className='fv-row'>
                                
                                 <CustomSelect
                                  options={vehicle?.data?.map((Obj: any) => { return { 'label': Obj?.title, 'value': Obj?.id } })}
                                  value={limitObj.vehicle_id}
                                  className={"form-control-solid w-100"}
                                  isMulti={undefined}
                                  onChange={(value: any) => {
                                    formik.setFieldValue(
                                      `booking_limits.[${index}].vehicle_id`,
                                      value?.value
                                    );
                                  }}
                                  isLoading={vehicleLoading}
                                  isDisabled={false}
                                  // placeholder="vehicle..."
                                />
                              </div>
                              {(formik.touched.booking_limits as any)?.[index]?.vehicle_id &&
                                (formik.errors.booking_limits as any)?.[index]?.vehicle_id && (
                                  <div className="fv-plugins-message-container mt-2">
                                    <span className="text-danger" role="alert">
                                      {(formik.errors.booking_limits as any)[index].vehicle_id}
                                    </span>
                                  </div>
                                )}

                            </div>
                            <div className='col-4'>
                              <label className='fw-semibold fs-6 mb-2'>Date Limit</label>

                            <DateTimePicker
                              className={clsx('form-control-solid  form-control  mb-3 p-2', {
                                'is-invalid':
                                  formik.touched.booking_limits &&
                                  Array.isArray(formik.touched.booking_limits) &&
                                  formik.touched.booking_limits[index]?.limit_date &&
                                  formik.errors.booking_limits &&
                                  Array.isArray(formik.errors.booking_limits) &&
                                  formik.errors.booking_limits[index]?.limit_date
                              })}
                              onChange={(value: any) => {
                                const updatedExpenses = [...(formik.values.booking_limits ?? [])]

                                if (value) {
                                  updatedExpenses[index].limit_date = value
                                  // formik.setFieldValue(`limit_date`, value);
                                } else {
                                  updatedExpenses[index].limit_date = undefined

                                  // formik.setFieldValue(`limit_date`, null);
                                }
                                formik.setFieldValue('booking_limits', updatedExpenses)
                              }}
                              // minDate={new Date()}
                              // maxDate={new Date()}
                              value={
                                formik.values.booking_limits?.[index]?.limit_date !== undefined
                                  ? new Date(formik.values.booking_limits[index].limit_date as unknown as number)
                                  : undefined
                              }


                              // value={((formik.values.expenses[index].limit_date) ? new Date(formik.values.expenses[index].limit_date) : null)}
                              format='dd/MM/yyyy'
                              name='limit_date'
                              disabled={formik.isSubmitting}
                            />
                            </div>

                            <div className='col-3'>
                              <label className='required fw-semibold fs-6 mb-2'>Max Limit</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='Limit'
                                  {...formik.getFieldProps(`booking_limits.[${index}].max_limit`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='text'
                                  autoComplete='off'
                                  disabled={formik.isSubmitting}
                                  onBlur={(e) => formik.handleBlur(e)}
                                />
                              </div>
                              {(formik.touched.booking_limits as any)?.[index]?.max_limit &&
                                (formik.errors.booking_limits as any)?.[index]?.max_limit && (
                                  <div className="fv-plugins-message-container mt-2">
                                    <span className="text-danger" role="alert">
                                      {(formik.errors.booking_limits as any)[index].max_limit}
                                    </span>
                                  </div>
                                )}
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className='col mt-4'>
                  <div>
                    <span
                      style={{ fontSize: "15px", fontWeight: "bold", color: "var(--common-theme-color)" }}
                      onClick={handleaddclick}
                      className='cursor-pointer'
                    >
                      + Add More 
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="row row-cols-1">
              <div className='text-center pt-5'>
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
