import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { initialModel, Model } from '../core/_models'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom';
import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'
import { CustomSelect } from './select-react/CustomSelect'
import { getModels as getVehicles } from '../../vehicle-management/core/_requests'
import { getModels as getCities } from '../../city-management/core/_requests'
import { createModel, updateModel } from '../core/_requests'

type Props = {
  isLoading: boolean
  model: Model
  ModuleName: any
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  airport_pricings: Yup.array()
    .defined()
    .of(
      Yup.object().shape({
        vehicle_id: Yup.string()
          .required('Please Select Vehicle'),
        city_id: Yup.string()
          .required('Please Select City'),
        price: Yup.string().required('Price is required')
          .typeError('Invalid Price')
          .test('valid-decimal', 'Invalid Price', value => {
            return /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any);
          }),
      })
    )
    .test('unique-city-vehicle', function (values, context) {
      if (!values) return true;

      let hasError = false;
      const seen = new Map<string, number>();

      const errors = values.map((item, index) => {
        const key = `${item.city_id}-${item.vehicle_id}`;
        if (seen.has(key)) {
          hasError = true;
          return context.createError({
            path: `airport_pricings[${index}].city_id`,
            message: 'Duplicate City and Vehicle combination is not allowed',
          });
        }
        seen.set(key, index);
        return null;
      }) as any;

      return hasError ? new Yup.ValidationError(errors.filter(Boolean)) : true;
    }),
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
    airport_pricings: model.airport_pricings || initialModel.airport_pricings,
  })

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

  const handlePricingrangeremove = (index: any) => {
    const updatedPricingRanges = formik.values.airport_pricings?.filter(
      (_, idx) => idx !== index
    ) as any;

    formik.setFieldValue('airport_pricings', updatedPricingRanges);
  };

  const handleaddpricingrangeclick = () => {

    formik.setFieldValue('airport_pricings', [
      ...formik.values.airport_pricings as any,
      {
        vehicle_id: '',
        city_id: '',
        price: '',
      },
    ]);
  };


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

  const handleVehicleChange = (value: any, index: number) => {
    formik.setFieldValue(`airport_pricings.${index}.vehicle_id`, value.value);
  }

  const [city, setCity] = useState() as any;
  const [cityLoading, setCityLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getCities(`airport_id=${model?.id ? model?.id : ''}`).then((result: any) => {
        setCity(result);
        setCityLoading(false);
      });
    })();
  }, []);

  const handleCityChange = (value: any, index: number) => {
    formik.setFieldValue(`airport_pricings.${index}.city_id`, value.value);
  }

  return (
    <>
      <KTCard
        className={`${model?.id ? "w-100" : "w-50 offset-md-3"} `}
      >
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>
          <form id={`add_${ModuleName.slug}_form`} className='form' onSubmit={formik.handleSubmit}>

            <div className='row row-cols-12'>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Name`}</label>
                  <input placeholder={`Name`}
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

            </div>

            {model?.id && (
              <div className='custom-cms-card mt-2 mb-4'>
                <div className="heading">
                  <h3 className="m-0">
                    {`Add the Prices`}
                  </h3>
                </div>

                <div className='content'>
                  <div className='row row-cols-2 g-3'>
                    {formik.values.airport_pricings?.map((pageObj: any, index: any) => {
                      return (
                        <div key={`pricing.${index}.id`} className='mt-2' >
                          <div className='property-faq position-relative'>
                            <div
                              className='delete-button bi bi-trash-fill'
                              onClick={() => handlePricingrangeremove(index)}
                            >
                            </div>
                            <div className='row row-cols-3'>
                              <div className='col'>
                                <label className='required fw-semibold fs-6 mb-2'>Vehicle</label>
                                <div className='fv-row'>
                                  <CustomSelect
                                    options={vehicle?.data?.map((Obj: any) => { return { 'label': Obj?.title, 'value': Obj?.id } })}
                                    value={pageObj.vehicle_id}
                                    className={'form-control-solid mb-3 mb-lg-0'}
                                    isMulti={undefined}
                                    onChange={(value: any) => { formik.setFieldValue('vehicle_id', value?.value); handleVehicleChange(value, index) }}
                                    isLoading={vehicleLoading}
                                    isDisabled={false}
                                  />

                                </div>

                                {(formik.touched.airport_pricings as any)?.[index]?.vehicle_id &&
                                  (formik.errors.airport_pricings as any)?.[index]?.vehicle_id && (
                                    <div className="fv-plugins-message-container mt-2">
                                      <span className="text-danger" role="alert">
                                        {(formik.errors.airport_pricings as any)[index].vehicle_id}
                                      </span>
                                    </div>
                                  )}

                              </div>

                              <div className='col'>
                                <label className='required fw-semibold fs-6 mb-2'>City</label>
                                <div className='fv-row'>
                                  <CustomSelect
                                    options={city?.data?.map((Obj: any) => { return { 'label': Obj?.name, 'value': Obj?.id } })}
                                    value={pageObj.city_id}
                                    className={'form-control-solid mb-3 mb-lg-0'}
                                    isMulti={undefined}
                                    onChange={(value: any) => { formik.setFieldValue('city_id', value?.value); handleCityChange(value, index) }}
                                    isLoading={cityLoading}
                                    isDisabled={false}
                                  />
                                </div>

                                {(formik.touched.airport_pricings as any)?.[index]?.city_id &&
                                  (formik.errors.airport_pricings as any)?.[index]?.city_id && (
                                    <div className="fv-plugins-message-container mt-2">
                                      <span className="text-danger" role="alert">
                                        {(formik.errors.airport_pricings as any)[index].city_id}
                                      </span>
                                    </div>
                                  )}

                              </div>

                              <div className='col'>
                                <label className='required fw-semibold fs-6 mb-2'>Price</label>
                                <div className='fv-row'>
                                  <input
                                    placeholder='Price'
                                    {...formik.getFieldProps(`airport_pricings.[${index}].price`)}
                                    className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                    type='text'
                                    autoComplete='off'
                                    disabled={formik.isSubmitting}
                                    onBlur={(e) => formik.handleBlur(e)}
                                  />
                                </div>
                                {(formik.touched.airport_pricings as any)?.[index]?.price &&
                                  (formik.errors.airport_pricings as any)?.[index]?.price && (
                                    <div className="fv-plugins-message-container mt-2">
                                      <span className="text-danger" role="alert">
                                        {(formik.errors.airport_pricings as any)[index].price}
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
                        onClick={handleaddpricingrangeclick}
                        className='cursor-pointer'
                      >
                        + Add More Prices
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}


            <div className="row row-cols-1">
              <div className='text-center'>
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
