import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty} from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { createModel, updateModel } from '../core/_requests'
import { initialModel, Model } from '../core/_models'
import clsx from 'clsx'

import { useNavigate } from 'react-router-dom';
import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'

import { getModels as getAirports } from '../../airport-management/core/_requests'
import { CustomSelect } from './select-react/CustomSelect'
import ImportPincode from '../list/components/header/ImportPincode'
import { getModels as getVehicles } from '../../vehicle-management/core/_requests'


type Props = {
  isLoading: boolean
  model: Model
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
  Pincodes: Yup.array()
    .defined()
    .of(
      Yup.object().shape({

        area_name: Yup.string()
          .required('Please Enter Area').max(100, "Enter less character"),
        pincode: Yup.string()
          .required('Pincode is required')
          .typeError('Invalid Pincode')
          .matches(/^\d{6}$/, 'Pincode must be a 6-digit number'),
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

  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });


  const [initialValues] = useState<Model>({
    ...model,
    name: model.name || initialModel.name,
    airport_id: model.airport_id || initialModel.airport_id,
    distance: model.distance || initialModel.distance,
    hotel: model.hotel || initialModel.hotel,
    Pincodes: model.Pincodes || initialModel.Pincodes,
    booking_limits: model.booking_limits || initialModel.booking_limits

  })

  const [airports, setAirports] = useState() as any;
  const [airportLoading, setAirportLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getAirports('').then((result: any) => {
        setAirports(result);
        setAirportLoading(false);
      });
    })();
  }, []);

  
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

      useEffect(() => {
        if (vehicle?.data && vehicle?.data.length > 0) {
          const existingVehicleIds = formik.values.booking_limits?.map((b: any) => b.vehicle_id) || [];
          let newIndex = formik.values.booking_limits?.length || 0;
          vehicle.data.forEach((vehicleObj: { id: any }) => {
            if (!existingVehicleIds.includes(vehicleObj.id)) {
              

              formik.setFieldValue(`booking_limits[${newIndex}].vehicle_id`, vehicleObj.id);
              formik.setFieldValue(`booking_limits[${newIndex}].max_limit`, 0);
              newIndex++; // increment after each addition
            }
          });
        }
      }, [vehicle?.data]);
      
      
      

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {

      try {

        if (isNotEmpty(values.id)) {
          updateModel(values, values.id).then((response: any) => {
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

  const handleChange = (value: any) => {
    setShow(value);
  }
  const handlePincoderemove = (index: any) => {
    const updatedPincodes = formik.values.Pincodes?.filter(
      (_, idx) => idx !== index
    ) as any;

    formik.setFieldValue('Pincodes', updatedPincodes);
  };

  const handleaddPincodeclick = () => {

    formik.setFieldValue('Pincodes', [
      ...formik.values.Pincodes as any,
      {
        pincode: 0,
        city_id: '',
        area_name: '',
      },
    ]);
  };



  return (
    <>

      <KTCard className='card'>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>
          <form id={`add_${ModuleName.slug}_form`} className='form' onSubmit={formik.handleSubmit}>
            <div className='text-end'>
              <ImportPincode />
            </div>
            <div className='row row-cols-3'>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`City Name`}</label>
                  <input placeholder={`City Name`}
                    {...formik.getFieldProps('name')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.name && formik.errors.name },
                      {
                        'is-valid': formik.touched.name && !formik.errors.name,
                      }
                    )}
                    type='text' name='name' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.name && formik.errors.name && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.name}</span>
                    </div>
                  )}
                </div>




              </div>
              <div className="col">
                <label className=' fw-semibold fs-6 mb-2'>Airport</label>
                <div className='fv-row mb-7'>
                  <CustomSelect
                    options={airports?.data?.map((Obj: any) => { return { 'label': Obj?.name, 'value': Obj?.id } })}
                    value={formik.values.airport_id}
                    className={'form-control-solid mb-3 mb-lg-0'}
                    isMulti={undefined}
                    onChange={(value: any) => { formik.setFieldValue('airport_id', value?.value); }}
                    isLoading={airportLoading}
                    isDisabled={false}
                    isClearable={true}
                  />
                </div>
              </div>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Distance For Airport`}</label>
                  <input placeholder={`Distance For Airport`}
                    {...formik.getFieldProps('distance')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.distance && formik.errors.distance },
                      {
                        'is-valid': formik.touched.distance && !formik.errors.distance,
                      }
                    )}
                    type='text' name='distance' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.distance && formik.errors.distance && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.distance}</span>
                    </div>
                  )}
                </div>
              </div>

             
              {formik.values.booking_limits?.map((VehicleObj: any, index: any) => {
                return (
                      <div key={`pricing.${index}.id`} className='mt-2' >
                            <div>
                              <div className='row row-cols-2'>


                                <div className='col-9'>
                                  <label className='required fw-semibold fs-6 mb-2'>Vehicle </label>
                                  <div className='fv-row'>

                                    <CustomSelect
                              options={vehicle?.data?.map((Obj: any) => { return { 'label': Obj?.title + Obj?.id, 'value': Obj?.id } })}
                              value={VehicleObj.vehicle_id}
                                      className={"form-control-solid w-100"}
                                      isMulti={undefined}
                                      onChange={(value: any) => {
                                        formik.setFieldValue(
                                          `booking_limits.[${index}].vehicle_id`,
                                          value?.value
                                        );
                                      }}
                                      isLoading={vehicleLoading}
                                      isDisabled={true}
                                    // placeholder="vehicle..."
                                    />
                                 
                                  </div>
                                  {/* {(formik.touched.booking_limits as any)?.[index]?.vehicle_id &&
                                    (formik.errors.booking_limits as any)?.[index]?.vehicle_id && (
                                      <div className="fv-plugins-message-container mt-2">
                                        <span className="text-danger" role="alert">
                                          {(formik.errors.booking_limits as any)[index].vehicle_id}
                                        </span>
                                      </div>
                                    )} */}

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
              <div className="col mt-5">
                <div className='fv-row my-7'>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      {...formik.getFieldProps('hotel')}
                      checked={formik.values.hotel}
                      onChange={(e) => formik.setFieldValue('hotel', e.target.checked)}
                      disabled={formik.isSubmitting}
                    />
                    <label className="form-check-label">Hotel</label>
                  </div>

                  {formik.touched.hotel && formik.errors.hotel && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.hotel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='custom-cms-card mt-2'>
              <div className="heading">
                <h3 className="m-0">
                  {`Add the Service Available Pincode`}
                </h3>
              </div>

              <div className='content'>
                <div className='row row-cols-lg-2 row-cols-lg-5 g-3'>
                  {formik.values.Pincodes?.map((pageObj: any, index: any) => {
                    return (
                      <div key={`pricing.${index}.id`} className='mt-2' >
                        <div className='property-faq position-relative'>
                          {formik.values.Pincodes && formik.values.Pincodes.length > 1 && (
                            <div
                              className='delete-button bi bi-trash-fill'
                              onClick={() => handlePincoderemove(index)}
                            >
                            </div>
                          )}
                          <div className='row row-cols-2'>


                            <div className='col'>
                              <label className='required fw-semibold fs-6 mb-2'>Pincode</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='Pincode'
                                  {...formik.getFieldProps(`Pincodes.[${index}].pincode`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='text'
                                  autoComplete='off'
                                  disabled={formik.isSubmitting}
                                  onBlur={(e) => formik.handleBlur(e)}
                                />
                              </div>
                              {(formik.touched.Pincodes as any)?.[index]?.pincode &&
                                (formik.errors.Pincodes as any)?.[index]?.pincode && (
                                  <div className="fv-plugins-message-container mt-2">
                                    <span className="text-danger" role="alert">
                                      {(formik.errors.Pincodes as any)[index].pincode}
                                    </span>
                                  </div>
                                )}

                            </div>

                            <div className='col'>
                              <label className='required fw-semibold fs-6 mb-2'>Area</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='Area'
                                  {...formik.getFieldProps(`Pincodes.[${index}].area_name`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='text'
                                  autoComplete='off'
                                  disabled={formik.isSubmitting}
                                  onBlur={(e) => formik.handleBlur(e)}
                                />
                              </div>
                              {(formik.touched.Pincodes as any)?.[index]?.area_name &&
                                (formik.errors.Pincodes as any)?.[index]?.area_name && (
                                  <div className="fv-plugins-message-container mt-2">
                                    <span className="text-danger" role="alert">
                                      {(formik.errors.Pincodes as any)[index].area_name}
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
                      onClick={handleaddPincodeclick}
                      className='cursor-pointer'
                    >
                      + Add More Pincode
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
