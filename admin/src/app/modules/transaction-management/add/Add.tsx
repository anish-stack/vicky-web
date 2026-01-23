import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { createModel, updateModel } from '../core/_requests'
import { initialModel, Model } from '../core/_models'
import clsx from 'clsx'

import { useNavigate } from 'react-router-dom';

import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'

import moment from "moment";
import { CustomSelect } from '../../localrentalplan-management/add/select-react/CustomSelect'

type Props = {
  isLoading: boolean
  model: Model
  ModuleName: any
}


const Add: FC<Props> = ({ model, isLoading, ModuleName }) => {

  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });

  const handleChange = (value: any) => {
    setShow(value);
  }


  const [initialValues] = useState<Model>({
    ...model,
    payment_id: model.payment_id || initialModel.payment_id,
    user_id: model.user_id || initialModel.user_id,
    places: model.places || initialModel.places,
    departure_date: model.departure_date || initialModel.departure_date,
    return_date: model.return_date || initialModel.return_date,
    distance: model.distance || initialModel.distance,
    trip_type: model.trip_type || initialModel.trip_type,
    trip_status: model.trip_status || initialModel.trip_status,
    method: model.method || initialModel.method,
    vehicle_id: model.vehicle_id || initialModel.vehicle_id,
    name: model.name || initialModel.name,
    pickup_address: model.pickup_address || initialModel.pickup_address,
    vehicle_name: model.vehicle_name || initialModel.vehicle_name,
    extra_km: model.extra_km || initialModel.extra_km,
    toll_tax: model.toll_tax || initialModel.toll_tax,
    parking_charges: model.parking_charges || initialModel.parking_charges,
    driver_charges: model.driver_charges || initialModel.driver_charges,
    night_charges: model.night_charges || initialModel.night_charges,
    fuel_charges: model.fuel_charges || initialModel.fuel_charges,
    car_tab: model.car_tab || initialModel.car_tab,
    dham_package_name: model.dham_package_name || initialModel.dham_package_name,
    dham_pickup_city_name: model.dham_pickup_city_name || initialModel.dham_pickup_city_name,
    dham_package_days: model.dham_package_days || initialModel.dham_package_days,
    dham_category_name: model.dham_category_name || initialModel.dham_category_name,
  })
  
  const validationSchema = Yup.object().shape({
    trip_status: Yup.string().required('Trip status is required')
  });

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
        
      } catch (error) {

      }
    }
  });

  const placesArray = JSON.parse(formik.values.places);

  const formatJSON = (String: any) => {
    const parsedUPI = JSON.parse(String);
    return JSON.stringify(parsedUPI, null, 2);
  };

  const UpiJson = formik.values.upi ? formatJSON(formik.values.upi) : null;

  return (
    <>
      <KTCard className='w-100 '>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>

          {formik.values.car_tab == 'chardham' ?
            <div className='custom-cms-card'>
              <div className="heading">
                <h3 className="m-0">
                  {`Booking Info`}
                </h3>
              </div>

              <div className='content'>
                <div className="row row-cols-4">
                 
                  {formik.values.dham_pickup_city_name && formik.values.dham_package_name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Places</p>
                      <div className=''>
                        <div className='start-align'>
                          <span className=''>
                            <span className="place-tag mt-2">
                              {formik.values.dham_pickup_city_name}
                            </span>
                            <i className="fa fa-arrow-right mx-1"></i>
                            <span className="place-tag mt-2">
                              {formik.values.dham_package_name}
                            </span> 
                          </span>
                        </div>
                      </div>
                    </div>
                  )}



                  {formik.values.name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Name</p>
                      <p className='mb-0'>{formik.values.name}</p>
                    </div>
                  )}

                  {formik.values.pickup_address && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Pickup Address</p>
                      <p className='mb-0'>{formik.values.pickup_address}</p>
                    </div>
                  )}

                  {formik.values.dham_category_name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Dham Category</p>
                      <p className='mb-0'>{formik.values.dham_category_name}</p>
                    </div>
                  )}

                  {formik.values.dham_package_name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Dham Package Name</p>
                      <p className='mb-0'>{formik.values.dham_package_name}</p>
                    </div>
                  )}

                  {formik.values.dham_pickup_city_name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Dham Pickup City</p>
                      <p className='mb-0'>{formik.values.dham_pickup_city_name}</p>
                    </div>
                  )}

                  {formik.values.dham_package_days && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Total Days</p>
                      <p className='mb-0'>{formik.values.dham_package_days}</p>
                    </div>
                  )}

                  {formik.values.vehicle_name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Vehicle Name</p>
                      <p className='mb-0'>{formik.values.vehicle_name}</p>
                    </div>
                  )}

                  {formik.values.original_amount && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Original Amount</p>
                      <p className='mb-0'><i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>{formik.values.original_amount}</p>
                    </div>
                  )}


                  {formik.values.paid_amount && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Paid Amount</p>
                      <p className='mb-0'><i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>{formik.values.paid_amount}</p>
                    </div>
                  )}

                  {formik.values.paid_amount && formik.values.original_amount && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Remaining Amount</p>
                      <p className='mb-0'>
                        <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                        {Number(formik.values.original_amount) - Number(formik.values.paid_amount)}
                      </p>
                    </div>
                  )}


                  {formik.values.distance && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Distance</p>
                      <p className='mb-0'>{formik.values.distance}</p>
                    </div>
                  )}

                  {formik.values.departure_date && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>PickUp Date</p>
                      <p className='mb-0'>{moment(formik.values.departure_date).format("DD-MM-YYYY hh:mm A")}</p>
                    </div>
                  )}

                  {formik.values.return_date && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Return Date</p>
                      <p className='mb-0'>{moment(formik.values.return_date).format("DD-MM-YYYY hh:mm A")}</p>
                    </div>
                  )}


                  {formik.values.trip_type && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Trip Type</p>
                      {formik.values.trip_type == 'oneWay' && <p className='mb-0'>One Way</p>}
                      {formik.values.trip_type == 'roundTrip' && <p className='mb-0'>Round Trip</p>}
                      {formik.values.trip_type == 'local' && <p className='mb-0'>Local Rental</p>}
                      {formik.values.trip_type == 'airport' && <p className='mb-0'>Airport Transfer</p>}
                    </div>
                  )}


                </div>
              </div>
            </div>
            :
            <div className='custom-cms-card'>
              <div className="heading">
                <h3 className="m-0">
                  {`Booking Info`}
                </h3>
              </div>

              <div className='content'>
                <div className="row row-cols-4">
                  {placesArray && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Places</p>
                      <div className=''>
                        <div className='start-align'>
                          {placesArray.map((data: any, index: number) => (
                            <span className='' key={index}>
                              {index != 0 && (
                                <i className="fa fa-arrow-right mx-1"></i>
                              )}
                              <span className="place-tag mt-2" key={index}>
                                {data?.label}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}


                  {formik.values.name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Name</p>
                      <p className='mb-0'>{formik.values.name}</p>
                    </div>
                  )}

                  {formik.values.pickup_address && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Pickup Address</p>
                      <p className='mb-0'>{formik.values.pickup_address}</p>
                    </div>
                  )}

                  {formik.values.vehicle_name && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Vehicle Name</p>
                      <p className='mb-0'>{formik.values.vehicle_name}</p>
                    </div>
                  )}

                  {formik.values.extra_km && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Extra fare/Km</p>
                      <p className='mb-0'><i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>{formik.values.extra_km}</p>
                    </div>
                  )}

                  {formik.values.toll_tax && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Toll & State Tax</p>
                      <p className='mb-0'>{formik.values.toll_tax ? "Included" : "Not Included"}</p>
                    </div>
                  )}


                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Parking Charges</p>
                    <p className='mb-0'>{formik.values.parking_charges ? "Included" : "Not Included"}</p>
                  </div>



                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Driver Charges</p>
                    <p className='mb-0'>{formik.values.driver_charges ? "Included" : "Not Included"}</p>
                  </div>



                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Night Charges</p>
                    <p className='mb-0'>{formik.values.night_charges ? "Included" : "Not Included"}</p>
                  </div>

                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Fuel Charges</p>
                    <p className='mb-0'>{formik.values.fuel_charges ? "Included" : "Not Included"}</p>
                  </div>


                  {formik.values.original_amount && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Original Amount</p>
                      <p className='mb-0'><i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>{formik.values.original_amount}</p>
                    </div>
                  )}


                  {formik.values.paid_amount && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Paid Amount</p>
                      <p className='mb-0'><i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>{formik.values.paid_amount}</p>
                    </div>
                  )}

                  {formik.values.paid_amount && formik.values.original_amount && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Remaining Amount</p>
                      <p className='mb-0'>
                        <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                        {Number(formik.values.original_amount) - Number(formik.values.paid_amount)}
                      </p>
                    </div>
                  )}


                  {formik.values.distance && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Distance</p>
                      <p className='mb-0'>{formik.values.distance}</p>
                    </div>
                  )}

                  {formik.values.departure_date && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>PickUp Date</p>
                      <p className='mb-0'>{moment(formik.values.departure_date).format("DD-MM-YYYY hh:mm A")}</p>
                    </div>
                  )}

                  {formik.values.return_date && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Return Date</p>
                      <p className='mb-0'>{moment(formik.values.return_date).format("DD-MM-YYYY hh:mm A")}</p>
                    </div>
                  )}


                  {formik.values.trip_type && (
                    <div className='col mt-2'>
                      <p className='fw-bold mb-0 fs-5'>Trip Type</p>
                      {formik.values.trip_type == 'oneWay' && <p className='mb-0'>One Way</p>}
                      {formik.values.trip_type == 'roundTrip' && <p className='mb-0'>Round Trip</p>}
                      {formik.values.trip_type == 'local' && <p className='mb-0'>Local Rental</p>}
                      {formik.values.trip_type == 'airport' && <p className='mb-0'>Airport Transfer</p>}
                    </div>
                  )}


                </div>
              </div>
            </div>
          }


          <div className='custom-cms-card'>
            <div className="heading">
              <h3 className="m-0">
                {`Razorpay Info`}
              </h3>
            </div>

            <div className='content'>
              <div className="row row-cols-4">
                {formik.values.payment_id && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Payment ID</p>
                    <p className='mb-0'>{formik.values.payment_id}</p>
                  </div>
                )}
                {formik.values.order_id && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Order ID</p>
                    <p className='mb-0'>{formik.values.order_id}</p>
                  </div>
                )}
                {formik.values.status && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Status</p>
                    {formik.values.status == 'captured' &&
                      <p className='mb-0'>success</p>
                    }
                    {formik.values.status == 'failed' &&
                      <p className='mb-0'>failed</p>
                    }
                  </div>
                )}
                {formik.values.method && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Method</p>
                    <p className='mb-0'>{formik.values.method}</p>
                  </div>
                )}

                {formik.values.paid_amount && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Amount</p>
                    <p className='mb-0'><i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>{formik.values.paid_amount}</p>
                  </div>
                )}

                {formik.values.bank && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Bank</p>
                    <p className='mb-0'>{formik.values.bank}</p>
                  </div>
                )}

                {formik.values.wallet && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Wallet</p>
                    <p className='mb-0'>{formik.values.wallet}</p>
                  </div>
                )}

                {formik.values.contact && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Contact</p>
                    <p className='mb-0'>{formik.values.contact}</p>
                  </div>
                )}

                {formik.values.error_description && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Error Description</p>
                    <p className='mb-0'>{formik.values.error_description}</p>
                  </div>
                )}

                {formik.values.error_reason && (
                  <div className='col mt-2'>
                    <p className='fw-bold mb-0 fs-5'>Error Reason</p>
                    <p className='mb-0'>{formik.values.error_reason}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
          <div className='custom-cms-card'>
            <div className="heading">
              <h3 className="m-0">
                {`Trip Status`}
              </h3>
            </div>

            <form id={`add_${ModuleName.slug}_form`} className='form p-5' onSubmit={formik.handleSubmit}>
              <div className='row row-cols-3'>
            
                  <div className='col'>
                    <label className='required fw-semibold fs-6 mb-2'>Trip Status</label>
                    {formik.values.trip_status != 'cancel' ? 
                      <>
                        <div className='fv-row'>
                          <CustomSelect
                            options={[
                              { 'label': 'Reserved', 'value': 'reserved' },
                              { 'label': 'Completed', 'value': 'completed' },
                              { 'label': 'Active', 'value': 'active' },
                              { 'label': 'Cancel', 'value': 'cancel' },
                            ]}
                            value={formik.values.trip_status}
                            className={'form-control-solid mb-3 mb-lg-0'}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              formik.setFieldValue('trip_status', value?.value);
                            }}
                            // isLoading={vehicleLoading}
                            isDisabled={false}
                          />

                        </div>

                        {formik.touched.trip_status && formik.errors.trip_status && (
                          <div className='fv-plugins-message-container'>
                            <span className='text-danger' role='alert'>{formik.errors.trip_status}</span>
                          </div>
                        )}
                      </>:
                    <>
                      <div className='ms-2  badge bg-danger'>
                        Trip is Cancelled

                      </div>
                    </>
                    
                    }
                  

                  </div>

                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='required fw-semibold fs-6 mb-2'>{`Additional km`}</label>
                    <input placeholder={`Additional km`}
                      {...formik.getFieldProps('additional_kilometers')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.additional_kilometers && formik.errors.additional_kilometers },
                        {
                          'is-valid': formik.touched.additional_kilometers && !formik.errors.additional_kilometers,
                        }
                      )}
                      type='text' name='additional_kilometers' autoComplete='off' disabled={formik.isSubmitting} />

                    {formik.touched.additional_kilometers && formik.errors.additional_kilometers && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.additional_kilometers}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col">
                  <div className='fv-row mb-7'>
                    <label className='required fw-semibold fs-6 mb-2'>{`Additional Time (Hours)`}</label>
                    <input placeholder={`Additional Time`}
                      {...formik.getFieldProps('additional_time')}
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        { 'is-invalid': formik.touched.additional_time && formik.errors.additional_time },
                        {
                          'is-valid': formik.touched.additional_time && !formik.errors.additional_time,
                        }
                      )}
                      type='text' name='additional_time' autoComplete='off' disabled={formik.isSubmitting} />

                    {formik.touched.additional_time && formik.errors.additional_time && (
                      <div className='fv-plugins-message-container'>
                        <span className='text-danger' role='alert'>{formik.errors.additional_time}</span>
                      </div>
                    )}
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
          </div>
        </KTCardBody>
      </KTCard>
    </>
  )

}

export { Add }
