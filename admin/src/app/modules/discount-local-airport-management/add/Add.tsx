import { FC, useState, useEffect, useCallback } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { initialModel, Model } from '../core/_models'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom';
import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'
import { createModel, getModels, updateModel } from '../core/_requests'
import { CustomSelect } from './select-react/CustomSelect'
import { getModels as getVehicles } from '../../vehicle-management/core/_requests'
import { getModels as getCities } from '../../city-management/core/_requests'
import Select from 'react-select'
import { Button, Modal } from 'react-bootstrap'



type Props = {
  isLoading: boolean
  model: Model
  ModuleName: any
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  overall_discount: Yup.number()
    .typeError('Discount must be a number')
    .required('Discount is required')
    .min(0, 'Discount cannot be negative')
    .max(99, 'Discount must be less than 100')
    .test('not-negative', 'Discount cannot be negative', (value: any) => value >= 0),
  discount_cities: Yup.array()
    .defined()
    .of(
      Yup.object().shape({
        city_id: Yup.number().required("City is required"),
        discount_trip_types: Yup.array()
          .of(
            Yup.object().shape({
              trip_type: Yup.string().required("Please select a Trip Type"),
              discount_vehicles: Yup.array()
                .of(
                  Yup.object().shape({
                    vehicle_id: Yup.string().required("Please select vehicle"),
                    discount: Yup.number()
                      .typeError('Discount must be a number')
                      .required('Discount is required')
                      .min(0, 'Discount cannot be negative')
                      .max(99, 'Discount must be less than 100')
                      .test('not-negative', 'Discount cannot be negative', (value: any) => value >= 0),
                  })
                )
                .test(
                  "unique-vehicle",
                  "Duplicate Vehicles Not valid",
                  function (discount_vehicles, context: any) {
                    if (!discount_vehicles) return true;
                    const tripIds = discount_vehicles.map((item) => item.vehicle_id);
                    const uniqueIds = new Set(tripIds);
                    const hasDuplicates = tripIds.length !== uniqueIds.size;

                    if (hasDuplicates) {
                      const errors = discount_vehicles.map((item, index) =>
                        tripIds.indexOf(item.vehicle_id) !== index
                          ? this.createError({
                            path: `${context.path}[${index}].vehicle_id`,
                            message: "Duplicate Vehicles Not valid",
                          })
                          : null
                      );
                      return new Yup.ValidationError(errors as any);
                    }
                    return true;
                  }
                ),
            })
          )
          .test(
            "unique-trip",
            "Duplicate Trip Record Not valid",
            function (discount_trip_types, context: any) {
              if (!discount_trip_types) return true;
              const tripIds = discount_trip_types.map((item) => item.trip_type);
              const uniqueIds = new Set(tripIds);
              const hasDuplicates = tripIds.length !== uniqueIds.size;

              if (hasDuplicates) {
                const errors = discount_trip_types.map((item, index) =>
                  tripIds.indexOf(item.trip_type) !== index
                    ? this.createError({
                      path: `${context.path}[${index}].trip_type`,
                      message: "Duplicate Trip Record Not valid",
                    })
                    : null
                );
                return new Yup.ValidationError(errors as any);
              }
              return true;
            }
          ),
      })
    ).test(
      "unique-city",
      "Duplicate City Not valid",
      function (discount_cities, context: any) {
        if (!discount_cities) return true;
        const cityIds = discount_cities.map((item) => item.city_id);
        const uniqueIds = new Set(cityIds);
        const hasDuplicates = cityIds.length !== uniqueIds.size;

        if (hasDuplicates) {
          const errors = discount_cities.map((item, index) =>
            cityIds.indexOf(item.city_id) !== index
              ? this.createError({
                path: `${context.path}[${index}].city_id`,
                message: "Duplicate City Not valid",
              })
              : null
          );
          return new Yup.ValidationError(errors as any);
        }
        return true;
      }
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
    slug: model.slug || initialModel.slug,
    discount_cities: model.discount_cities || initialModel.discount_cities,
    overall_discount: model.overall_discount || initialModel.overall_discount,
    apply_overall_discount: model.apply_overall_discount || initialModel.apply_overall_discount,
    apply_citywise_discount: model.apply_citywise_discount || initialModel.apply_citywise_discount,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getModels(`slug=local_airport`) as any;
        if (data.status == true) {
          formik.setFieldValue('title', data?.data?.title);
          formik.setFieldValue('slug', data?.data?.slug);
          formik.setFieldValue('discount_cities', data?.data?.discount_cities);
          formik.setFieldValue('overall_discount', data?.data?.overall_discount);
          formik.setFieldValue('apply_overall_discount', data?.data?.apply_overall_discount);
          formik.setFieldValue('apply_citywise_discount', data?.data?.apply_citywise_discount);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };

    fetchData();
  }, []);

  const handleDiscountRemove = (index: any) => {
    const updatedRanges = formik.values.discount_cities?.filter(
      (_: any, idx: any) => idx !== index
    ) as any;

    formik.setFieldValue('discount_cities', updatedRanges);
  };

  const handleAddDiscountClick = () => {

    formik.setFieldValue('discount_cities', [
      ...formik.values?.discount_cities as any,
      {
        pickup_city_name: '',
        pickup_city_place_id: '',
        drop_city_name: '',
        drop_city_place_id: '',
        city_id: ''
      },
    ]);
  };

  const tripTypesArray = [
    { label: "Local", value: "local" },
    { label: "Airport", value: "airport" }
  ];

  const handleVehicleChange = (value: any, cityIndex: number, tripTypeIndex: number) => {
    formik.setFieldValue(`discount_cities.[${cityIndex}].discount_trip_types.[${tripTypeIndex}].trip_type`, value.value);
  }

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

  const fetchPlaces = async (query: any, setMapData: any) => {
    if (!query) {
      setMapData([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/map/autocompletecity?query=${query}`);
      const data = await response.json();

      if (data.predictions) {
        const apiData = data.predictions?.map((item: any) => ({
          label: item.description,
          value: item.place_id,
        }));
        setMapData(apiData);
      } else {
        setMapData([]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      setMapData([]);
    }
  };

  const [startMapData, setStartMapData] = useState([]) as any;
  const [startSearchValue, setStartSearchValue] = useState('');


  useEffect(() => {
    fetchPlaces(startSearchValue, setStartMapData);
  }, [startSearchValue]);
  let timer: NodeJS.Timeout;

  const handleSearchChange = useCallback((inputValue: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      setStartSearchValue(inputValue);
    }, 500);
  }, []);

  const [cities, setCities] = useState() as any;
  const [cityLoading, setCityLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getCities('').then((result: any) => {
        setCities(result);
        setCityLoading(false);
      });
    })();
  }, []);

  const [initialDiscountValues] = useState({
      discount: 0,
      inc_dec: false
    }) as any;
  
    const validationDiscountSchema = Yup.object().shape({
      discount: Yup.number()
        .typeError('Discount must be a number')
        .required('Discount is required')
        .min(0, 'Discount cannot be negative')
        .max(99, 'Discount must be less than 100')
        .test('is-integer', 'Discount must be an integer', (value) => Number.isInteger(value))
        .test('not-negative', 'Discount cannot be negative', (value: any) => value >= 0),
    });
    const formikDiscount = useFormik({
      initialValues: initialDiscountValues,
      validationSchema: validationDiscountSchema,
      onSubmit: async (values, { setSubmitting }) => {
        try {
          const updatedDiscountCity = {
            ...formik.values,
            discount_cities: formik.values.discount_cities.map((city: any) => ({
              ...city,
              discount_trip_types: city.discount_trip_types.map((tripType: any) => ({
                ...tripType,
                discount_vehicles: tripType.discount_vehicles.map((vehicle: any) => ({
                  ...vehicle,
                  discount: values.inc_dec ? Number(vehicle.discount) + Number(values?.discount) : Number(vehicle.discount) - Number(values?.discount) < 0 ? 0 : Number(vehicle.discount) - Number(values?.discount)
                }))
              }))
            }))
          };
          if (updatedDiscountCity?.discount_cities) {
            formik.setFieldValue("discount_cities", updatedDiscountCity?.discount_cities);
            formikDiscount.setFieldValue("discount", 0);
            handleClose();
          }
        } catch (error) {
  
        }
      }
    });

  const [discountShow, setDiscountShow] = useState(false);

  const handleShow = () => setDiscountShow(true);
  const handleClose = () => setDiscountShow(false);

  return (
    <>
      <Modal show={discountShow} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Cities Discount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className='form' onSubmit={formikDiscount.handleSubmit}>
            <div className='fv-row mb-4'>
              <label className='required fw-semibold fs-6 mb-2'>{`Discount`}</label>
              <input placeholder={`Discount`}
                {...formikDiscount.getFieldProps('discount')}
                className={clsx(
                  'form-control form-control-solid mb-3 mb-lg-0',
                  { 'is-invalid': formikDiscount.touched.discount && formikDiscount.errors.discount },
                  {
                    'is-valid': formikDiscount.touched.discount && !formikDiscount.errors.discount,
                  }
                )}
                type='text' name='discount' autoComplete='off' disabled={formikDiscount.isSubmitting} />

              {formikDiscount.touched.discount && formikDiscount.errors.discount && (
                <div className='fv-plugins-message-container'>
                  <span className='text-danger' role='alert'>{formikDiscount.errors.discount as any}</span>
                </div>
              )}
            </div>

            <div className="fv-row mb-7">
              <label className="required fw-semibold fs-6 mb-2">{`Inc/Dec`}</label>

              <div className="d-flex mt-3">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="inc_decYes"
                    name="inc_dec"
                    value="true"
                    checked={formikDiscount.values.inc_dec === true}
                    onChange={() => formikDiscount.setFieldValue('inc_dec', true)}
                    disabled={formikDiscount.isSubmitting}
                  />
                  <label className="form-check-label" htmlFor="inc_decYes">
                    Increment
                  </label>
                </div>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="inc_decNo"
                    name="inc_dec"
                    value="false"
                    checked={formikDiscount.values.inc_dec === false}
                    onChange={() => formikDiscount.setFieldValue('inc_dec', false)}
                    disabled={formikDiscount.isSubmitting}
                  />
                  <label className="form-check-label" htmlFor="inc_decNo">
                    Decrement
                  </label>
                </div>
              </div>

              {formikDiscount.touched.inc_dec && formikDiscount.errors.inc_dec && (
                <div className="fv-plugins-message-container">
                  <span className="text-danger" role="alert">{formikDiscount.errors.inc_dec as any}</span>
                </div>
              )}
            </div>
            <Button type="submit" variant="primary" disabled={formikDiscount.isSubmitting}>
              Apply to all
            </Button>
          </form>
        </Modal.Body>
        {/* <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Save Changes
              </Button>
            </Modal.Footer> */}
      </Modal>
      <KTCard
        className={"w-100"}
      >
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>
          <form id={`add_${ModuleName.slug}_form`} className='form' onSubmit={formik.handleSubmit}>

            <div className='row row-cols-5'>
              <div className="col">
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


              <div className='col'>
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Over All Discount`}</label>
                  <input placeholder={`Over All Discount`}
                    {...formik.getFieldProps('overall_discount')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.overall_discount && formik.errors.overall_discount },
                      {
                        'is-valid': formik.touched.overall_discount && !formik.errors.overall_discount,
                      }
                    )}
                    type='text' name='overall_discount' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.overall_discount && formik.errors.overall_discount && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.overall_discount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-2">{`Apply Overall Discount`}</label>

                  <div className="d-flex mt-3">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="apply_overall_discountYes"
                        name="apply_overall_discount"
                        value="true"
                        checked={formik.values.apply_overall_discount === true}
                        onChange={() => formik.setFieldValue('apply_overall_discount', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="apply_overall_discountYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="apply_overall_discountNo"
                        name="apply_overall_discount"
                        value="false"
                        checked={formik.values.apply_overall_discount === false}
                        onChange={() => formik.setFieldValue('apply_overall_discount', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="apply_overall_discountNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.apply_overall_discount && formik.errors.apply_overall_discount && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.apply_overall_discount}</span>
                    </div>
                  )}
                </div>
              </div>


              <div className="col">
                <div className="fv-row mb-7">
                  <label className="required fw-semibold fs-6 mb-2">{`Apply Citywise Discount`}</label>

                  <div className="d-flex mt-3">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="apply_citywise_discountYes"
                        name="apply_citywise_discount"
                        value="true"
                        checked={formik.values.apply_citywise_discount === true}
                        onChange={() => formik.setFieldValue('apply_citywise_discount', true)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="apply_citywise_discountYes">
                        Yes
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="apply_citywise_discountNo"
                        name="apply_citywise_discount"
                        value="false"
                        checked={formik.values.apply_citywise_discount === false}
                        onChange={() => formik.setFieldValue('apply_citywise_discount', false)}
                        disabled={formik.isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="apply_citywise_discountNo">
                        No
                      </label>
                    </div>
                  </div>

                  {formik.touched.apply_citywise_discount && formik.errors.apply_citywise_discount && (
                    <div className="fv-plugins-message-container">
                      <span className="text-danger" role="alert">{formik.errors.apply_citywise_discount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='col'>
                <div className='text-end'>
                  <div
                    className='btn btn-light-primary mb-5 ms-auto mt-5'
                    onClick={handleShow}
                  >
                    <span className='indicator-label'>Change Cities Discount</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className='custom-cms-card mt-2 mb-4'>
                <div className='content'>
                  <div className='row row-cols-1 g-3'>
                    {formik.values.discount_cities?.map((cityObj: any, cityIndex: number) => {
                      return (
                        <div key={`discount_cities.${cityIndex}.id`} className='mt-2'>
                          <div className='property-faq position-relative'>
                            <div
                              className='delete-button bi bi-trash-fill'
                              onClick={() => handleDiscountRemove(cityIndex)}
                            ></div>

                            <div className='row row-cols-2'>
                              <div className='col'>
                                <label className='fw-semibold fs-6 mb-2'>Select City</label>
                                <div className='fv-row'>
                                  <CustomSelect
                                    options={cities?.data?.map((Obj: any) => { return { 'label': Obj?.name, 'value': Obj?.id } })}
                                    value={cityObj?.city_id}
                                    className={"form-control-solid w-100"}
                                    isMulti={undefined}
                                    onChange={(value: any) => {
                                      formik.setFieldValue(
                                        `discount_cities.[${cityIndex}].city_id`,
                                        value?.value
                                      );
                                    }}
                                    isLoading={cityLoading}
                                    isDisabled={false}
                                    placeholder="Select city..."
                                  />

                                  {(formik.touched.discount_cities as any)?.[cityIndex]?.city_id &&
                                    (formik.errors.discount_cities as any)?.[cityIndex]?.city_id && (
                                      <div className="fv-plugins-message-container mt-1">
                                        <span className="text-danger" role="alert">
                                          {(formik.errors.discount_cities as any)[cityIndex].city_id}
                                        </span>
                                      </div>
                                    )}
                                </div>

                              </div>
                            </div>
                            <div className='row row-cols-2'>
                              {(!cityObj?.discount_trip_types || cityObj.discount_trip_types?.length == 0) && (
                                <div>
                                  <span
                                    style={{ fontSize: "14px", fontWeight: "600", color: "var(--common-theme-color)" }}
                                    className="mt-3 cursor-pointer"
                                    onClick={() => {
                                      const updatedCities = [...formik.values?.discount_cities];
                                      updatedCities[cityIndex].discount_trip_types = [
                                        ...(updatedCities[cityIndex].discount_trip_types || []),
                                        { trip_type: '' }
                                      ];
                                      formik.setFieldValue("discount_cities", updatedCities);
                                    }}
                                  >
                                    + Add Triptype
                                  </span>
                                </div>
                              )}
                              {cityObj.discount_trip_types?.map((tripTypeObj: any, tripTypeIndex: number) => (
                                <div className='col mt-3' key={`discount_cities.${cityIndex}.discount_trip_types.${tripTypeIndex}`}>
                                  <div className='property-faq position-relative'>
                                    <div
                                      className='delete-button bi bi-trash-fill'
                                      onClick={() => {
                                        const updatedStops = cityObj.discount_trip_types.filter((_: any, i: number) => i !== tripTypeIndex);
                                        formik.setFieldValue(`discount_cities.[${cityIndex}].discount_trip_types`, updatedStops);
                                      }}
                                    ></div>
                                    <label className='fw-semibold fs-6 mb-2'>Trip Type</label>
                                    <div className="row row-cols-2 g-1">
                                      <div className="col-md-12">
                                        <CustomSelect
                                          options={tripTypesArray}
                                          value={tripTypeObj?.trip_type}
                                          className={"form-control-solid w-100"}
                                          isMulti={undefined}
                                          onChange={(value: any) => {
                                            formik.setFieldValue(`discount_cities.[${cityIndex}].discount_trip_types.[${tripTypeIndex}].trip_type`, value?.value);
                                            handleVehicleChange(value, cityIndex, tripTypeIndex);
                                          }}
                                          isLoading={false}
                                          isDisabled={false}
                                          placeholder="Select trip..."
                                        />

                                        {(formik.touched.discount_cities as any)?.[cityIndex]?.discount_trip_types?.[tripTypeIndex]?.trip_type &&
                                          (formik.errors.discount_cities as any)?.[cityIndex]?.discount_trip_types?.[tripTypeIndex]?.trip_type && (
                                            <div className="fv-plugins-message-container mt-1">
                                              <span className="text-danger" role="alert">
                                                {(formik.errors.discount_cities as any)[cityIndex].discount_trip_types[tripTypeIndex].trip_type}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    </div>

                                    <div className="mx-3 mt-1">
                                      {tripTypeObj.discount_vehicles?.map((vehicleObj: any, vehicleIndex: number) => (
                                        <div key={`discount_cities.${cityIndex}.discount_trip_types.${tripTypeIndex}.discount_vehicles.${vehicleIndex}`} className="row g-2">
                                          <div className="col-md-6">
                                            <CustomSelect
                                              options={vehicle?.data?.map((Obj: any) => { return { 'label': Obj?.title, 'value': Obj?.id } })}
                                              value={vehicleObj?.vehicle_id}
                                              className={"form-control-solid w-100"}
                                              isMulti={undefined}
                                              onChange={(value: any) => {
                                                formik.setFieldValue(
                                                  `discount_cities.[${cityIndex}].discount_trip_types.[${tripTypeIndex}].discount_vehicles.[${vehicleIndex}].vehicle_id`,
                                                  value?.value
                                                );
                                              }}
                                              isLoading={vehicleLoading}
                                              isDisabled={false}
                                              placeholder="Select vehicle..."
                                            />

                                            {(formik.touched.discount_cities as any)?.[cityIndex]?.discount_trip_types?.[tripTypeIndex]?.discount_vehicles?.[vehicleIndex]?.vehicle_id &&
                                              (formik.errors.discount_cities as any)?.[cityIndex]?.discount_trip_types?.[tripTypeIndex]?.discount_vehicles?.[vehicleIndex]?.vehicle_id && (
                                                <div className="fv-plugins-message-container mt-1">
                                                  <span className="text-danger" role="alert">
                                                    {(formik.errors.discount_cities as any)[cityIndex].discount_trip_types[tripTypeIndex].discount_vehicles?.[vehicleIndex]?.vehicle_id}
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                          <div className="col-md-5">
                                            <input
                                              type="text"
                                              className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                              placeholder="Discount (%)"
                                              {...formik.getFieldProps(`discount_cities.[${cityIndex}].discount_trip_types.[${tripTypeIndex}].discount_vehicles.[${vehicleIndex}].discount`)}
                                              autoComplete='off'
                                              onBlur={(e) => formik.handleBlur(e)}
                                              disabled={formik.isSubmitting}
                                            />
                                            {(formik.touched.discount_cities as any)?.[cityIndex]?.discount_trip_types?.[tripTypeIndex]?.discount_vehicles?.[vehicleIndex]?.discount &&
                                              (formik.errors.discount_cities as any)?.[cityIndex]?.discount_trip_types?.[tripTypeIndex]?.discount_vehicles?.[vehicleIndex]?.discount && (
                                                <div className="fv-plugins-message-container mt-1">
                                                  <span className="text-danger" role="alert">
                                                    {(formik.errors.discount_cities as any)[cityIndex].discount_trip_types[tripTypeIndex].discount_vehicles?.[vehicleIndex]?.discount}
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                          <div className="col-md-1 d-flex">
                                            <div
                                              className="border border-danger w-100 text-center mb-1 mt-1 rounded-1 custom-delete-button d-flex justify-content-center align-items-center"
                                              style={{ borderWidth: "2px" }}
                                              onClick={() => {
                                                const updatedVehicles = tripTypeObj.discount_vehicles.filter((_: any, i: number) => i !== vehicleIndex);
                                                formik.setFieldValue(`discount_cities.[${cityIndex}].discount_trip_types.[${tripTypeIndex}].discount_vehicles`, updatedVehicles);
                                              }}
                                            >
                                              <i className="bi bi-trash-fill text-danger"></i>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      <span
                                        style={{ fontSize: "14px", fontWeight: "600", color: "var(--common-theme-color)" }}
                                        className="mt-3 cursor-pointer"
                                        onClick={() => {
                                          const newVehicle = { vehicle_id: "", discount: "" };
                                          formik.setFieldValue(
                                            `discount_cities.[${cityIndex}].discount_trip_types.[${tripTypeIndex}].discount_vehicles`,
                                            [...(tripTypeObj.discount_vehicles || []), newVehicle]
                                          );
                                        }}
                                      >
                                        + Add Discount
                                      </span>
                                    </div>
                                  </div>

                                  {tripTypeIndex === cityObj.discount_trip_types.length - 1 && (
                                    <div>
                                      <span
                                        style={{ fontSize: "14px", fontWeight: "600", color: "var(--common-theme-color)" }}
                                        className="mt-3 cursor-pointer"
                                        onClick={() => {
                                          const updatedCities = [...formik.values?.discount_cities];
                                          updatedCities[cityIndex].discount_trip_types = [
                                            ...(updatedCities[cityIndex].discount_trip_types || []),
                                            { trip_type: '' }
                                          ];
                                          formik.setFieldValue("discount_cities", updatedCities);
                                        }}
                                      >
                                        + Add Triptype
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
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
                        onClick={handleAddDiscountClick}
                        className='cursor-pointer'
                      >
                        + Add More Cities
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

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
