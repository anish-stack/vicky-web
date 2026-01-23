import { FC, useState, useEffect, useCallback } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { createModel, updateModel } from '../core/_requests'
import { initialModel, Model } from '../core/_models'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom';
import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'
import { CustomSelect } from './select-react/CustomSelect'
import { getModels as getDhamCategories } from '../../dhamcategory-management/core/_requests'
import { getModels as getVehicles } from '../../vehicle-management/core/_requests'
import Select from 'react-select'


type Props = {
  isLoading: boolean
  model: Model
  ModuleName: any
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileSize', 'File is too large. Maximum size is 5MB', value => {
      return value && value.size <= 5 * 1024 * 1024;
    })
    .test('fileFormat', 'Unsupported file format. Only JPG, JPEG, and PNG are allowed', value => {
      return value && ['image/jpeg', 'image/png'].includes(value.type);
    }),
  dham_category_id: Yup.string().required('Please Select the Dham Category'),
  dham_pickup_cities: Yup.array()
    .defined()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Pickup City is required"),
        days: Yup.number()
          .required("Days is required")
          .max(30, "Days cannot be more than 30")
          .min(1, "Days must be at least 1")
          .integer("Invalid day"),

        dham_stops: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required("Itinerary heading is required"),
          })
        ),

        dham_pricings: Yup.array()
          .of(
            Yup.object().shape({
              vehicle_id: Yup.string().required("Please select a vehicle"),
              price: Yup.string()
                .required("Price is required")
                .typeError("Invalid Price")
                .test("valid-decimal", "Invalid Price", (value) =>
                  /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any)
                ),
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
            "Duplicate vehicles selected",
            function (dham_pricings, context: any) {
              if (!dham_pricings) return true;
              const vehicleIds = dham_pricings.map((item) => item.vehicle_id);
              const uniqueIds = new Set(vehicleIds);
              const hasDuplicates = vehicleIds.length !== uniqueIds.size;

              if (hasDuplicates) {
                const errors = dham_pricings.map((item, index) =>
                  vehicleIds.indexOf(item.vehicle_id) !== index
                    ? this.createError({
                      path: `${context.path}[${index}].vehicle_id`,
                      message: "Duplicate vehicle selected",
                    })
                    : null
                );
                return new Yup.ValidationError(errors as any);
              }
              return true;
            }
          ),
      })
    ),
});

const validationUpdateSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
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
  dham_category_id: Yup.string().required('Please Select the Dham Category'),

  dham_pickup_cities: Yup.array()
    .defined()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Pickup City is required"),
        days: Yup.number()
          .required("Days is required")
          .max(30, "Days cannot be more than 30")
          .min(1, "Days must be at least 1")
          .integer("Invalid day"),

        dham_stops: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required("Itinerary heading is required"),
          })
        ),

        dham_pricings: Yup.array()
          .of(
            Yup.object().shape({
              vehicle_id: Yup.string().required("Please select a vehicle"),
              price: Yup.string()
                .required("Price is required")
                .typeError("Invalid Price")
                .test("valid-decimal", "Invalid Price", (value) =>
                  /^[0-9]+(\.[0-9]{1,2})?$/.test(value as any)
                ),
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
            "Duplicate vehicles selected",
            function (dham_pricings, context: any) {
              if (!dham_pricings) return true;
              const vehicleIds = dham_pricings.map((item) => item.vehicle_id);
              const uniqueIds = new Set(vehicleIds);
              const hasDuplicates = vehicleIds.length !== uniqueIds.size;

              if (hasDuplicates) {
                const errors = dham_pricings.map((item, index) =>
                  vehicleIds.indexOf(item.vehicle_id) !== index
                    ? this.createError({
                      path: `${context.path}[${index}].vehicle_id`,
                      message: "Duplicate vehicle selected",
                    })
                    : null
                );
                return new Yup.ValidationError(errors as any);
              }
              return true;
            }
          ),
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
    name: model.name || initialModel.name,
    image: model.image || initialModel.image,
    dham_category_id: model.dham_category_id || initialModel.dham_category_id,
    distance: model.distance || initialModel.distance,
    dham_pickup_cities: model.dham_pickup_cities || initialModel.dham_pickup_cities
  })

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: model.id ? validationUpdateSchema : validationSchema,
    onSubmit: async (values, { setSubmitting }) => {

      let formData = new FormData();
      formData.append('name', values.name as string);
      formData.append('dham_category_id', values.dham_category_id as string);
      formData.append('distance', values.distance as string);
      formData.append('image', values.image as any);
      formData.append('dham_pickup_cities', JSON.stringify(values.dham_pickup_cities) as any);

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

  const [dhamCategories, setDhamCategories] = useState() as any;
  const [dhamCategoryLoading, setDhamCategoryLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getDhamCategories('').then((result: any) => {
        setDhamCategories(result);
        setDhamCategoryLoading(false);
      });
    })();
  }, []);

  const handleChange = (value: any) => {
    setShow(value);
  }

  const handleDhamPackageRemove = (index: any) => {
    const updatedRanges = formik.values.dham_pickup_cities?.filter(
      (_: any, idx: any) => idx !== index
    ) as any;

    formik.setFieldValue('dham_pickup_cities', updatedRanges);
  };

  const handleAddDhamPackageClick = () => {

    formik.setFieldValue('dham_pickup_cities', [
      ...formik.values.dham_pickup_cities as any,
      {
        name: '',
        days: '',
      },
    ]);
  };

  const blankImg = `${process.env.REACT_APP_BACKEND_BASE_URL}/profilepic/default.jpg`;
  const [avatarImg, setAvatarImg] = useState(`${process.env.REACT_APP_BACKEND_BASE_URL}/dham/${formik.values.image}`);

  const selectStyles = {
    control: (_: any, { selectProps: { width } }: any) => ({
      ..._,
      background: '#f5f8fa',
      border: 'none',
      padding: '0.3rem 1rem',
      borderRadius: '7px'
    }),
  }

  let timer: NodeJS.Timeout;

  const handleSearchChange = useCallback((inputValue: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fetchPlaces(inputValue);
    }, 500);
  }, []);

  const calculateDistance = async () => {
    try {
      let accumulatedDistance = 0;

      const routes = formik.values.dham_pickup_cities.filter((route: any) => route.place_id);

      for (let i = 0; i < routes.length - 1; i++) {
        const origins = `place_id:${routes[i].place_id}`;
        const destinations = `place_id:${routes[i + 1].place_id}`;

        const response = await fetch(
          `${process.env.REACT_APP_THEME_API_URL}/map/distancematrix?origins=${origins}&destinations=${destinations}`
        );
        const data = await response.json();

        const pairDistance = data.rows[0].elements.reduce((sum: number, element: any) => {
          return sum + (element?.distance?.value || 0);
        }, 0);

        accumulatedDistance += pairDistance;
      }

      const totalDistanceInKilometers = parseFloat((accumulatedDistance / 1000).toFixed(2));
      return totalDistanceInKilometers;
    } catch (error) {
      console.error("Error calculating distances:", error);
      return 0;
    }
  };


  const [MapData, setMapData] = useState([]) as any;

  const fetchPlaces = async (query: any) => {
    if (!query) {
      setMapData([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_THEME_API_URL}/map/autocompletecity?query=${query}`);
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

  const handleVehicleChange = (value: any, cityIndex: number, pricingIndex: number) => {
    formik.setFieldValue(`dham_pickup_cities.[${cityIndex}].dham_pricings.[${pricingIndex}].vehicle_id`, value.value);
  }


  return (
    <>

      <KTCard className='card w-100'>
        <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
        <KTCardBody>
          <form id={`add_${ModuleName.slug}_form`} className='form' onSubmit={formik.handleSubmit}>
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
            <div className='row row-cols-2'>

              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Dham Package Name`}</label>
                  <input placeholder={`Dham Package Name`}
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
              <div className='col'>
                <label className='required fw-semibold fs-6 mb-2'>Dham Category</label>
                <div className='fv-row mb-7'>
                  <CustomSelect
                    options={dhamCategories?.data?.map((Obj: any) => { return { 'label': Obj?.name, 'value': Obj?.id } })}
                    value={formik.values.dham_category_id}
                    className={'form-control-solid mb-3 mb-lg-0'}
                    isMulti={undefined}
                    onChange={(value: any) => { formik.setFieldValue('dham_category_id', value?.value); }}
                    isLoading={dhamCategoryLoading}
                    isDisabled={false}
                  />
                  {formik.touched.dham_category_id && formik.errors.dham_category_id && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.dham_category_id}</span>
                    </div>
                  )}
                </div>

              </div>

            </div>


            <div className='custom-cms-card mt-2 mb-4'>
              <div className='content'>
                <div className='row row-cols-1 g-3'>
                  {formik.values.dham_pickup_cities?.map((cityObj: any, cityIndex: number) => {
                    return (
                      <div key={`dham_pickup_cities.${cityIndex}.id`} className='mt-2'>
                        <div className='property-faq position-relative'>
                          <div
                            className='delete-button bi bi-trash-fill'
                            onClick={() => handleDhamPackageRemove(cityIndex)}
                          ></div>

                          <div className='row row-cols-2'>
                            <div className='col'>
                              <label className='fw-semibold fs-6 mb-2'>Pickup City</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='Pickup City'
                                  {...formik.getFieldProps(`dham_pickup_cities.[${cityIndex}].name`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='text'
                                  autoComplete='off'
                                  onBlur={(e) => formik.handleBlur(e)}
                                  disabled={formik.isSubmitting}
                                />
                              </div>
                              {(formik.touched.dham_pickup_cities as any)?.[cityIndex]?.name &&
                                (formik.errors.dham_pickup_cities as any)?.[cityIndex]?.name && (
                                  <div className="fv-plugins-message-container mt-2">
                                    <span className="text-danger" role="alert">
                                      {(formik.errors.dham_pickup_cities as any)[cityIndex].name}
                                    </span>
                                  </div>
                                )}
                            </div>

                            <div className='col'>
                              <label className='fw-semibold fs-6 mb-2'>Total Days</label>
                              <div className='fv-row'>
                                <input
                                  placeholder='Total Days'
                                  {...formik.getFieldProps(`dham_pickup_cities.[${cityIndex}].days`)}
                                  className={clsx('form-control form-control-solid mb-3 mb-lg-0')}
                                  type='text'
                                  autoComplete='off'
                                  onBlur={(e) => formik.handleBlur(e)}
                                  disabled={formik.isSubmitting}
                                />
                              </div>
                              {(formik.touched.dham_pickup_cities as any)?.[cityIndex]?.days &&
                                (formik.errors.dham_pickup_cities as any)?.[cityIndex]?.days && (
                                  <div className="fv-plugins-message-container mt-2">
                                    <span className="text-danger" role="alert">
                                      {(formik.errors.dham_pickup_cities as any)[cityIndex].days}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>

                          <div className='row row-cols-2'>
                            <div className='col mt-3'>
                              <label className='fw-semibold fs-6 mb-2'>Dham Itineraries</label>
                              {cityObj.dham_stops?.map((stopObj: any, stopIndex: number) => (
                                <div key={`dham_pickup_cities.${cityIndex}.dham_stops.${stopIndex}`}>
                                  <div className='row row-cols-2 g-1'>
                                    <div className='col col-md-5 mb-1'>
                                      <input
                                        placeholder='Itinerary heading'
                                        {...formik.getFieldProps(`dham_pickup_cities.[${cityIndex}].dham_stops.[${stopIndex}].name`)}
                                        className={clsx('form-control form-control-solid me-2')}
                                        type='text'
                                        autoComplete='off'
                                        onBlur={(e) => formik.handleBlur(e)}
                                        disabled={formik.isSubmitting}
                                      />

                                    </div>

                                    <div className='col col-md-6 mb-1'>
                                      <input
                                        placeholder='Description'
                                        {...formik.getFieldProps(`dham_pickup_cities.[${cityIndex}].dham_stops.[${stopIndex}].description`)}
                                        className={clsx('form-control form-control-solid me-2')}
                                        type='text'
                                        autoComplete='off'
                                        onBlur={(e) => formik.handleBlur(e)}
                                        disabled={formik.isSubmitting}
                                      />

                                    </div>

                                    <div className='col col-md-1 d-flex'>
                                      <div
                                        className='border border-danger w-100 text-center mb-1 mt-1 rounded-1 custom-delete-button d-flex justify-content-center align-items-center'
                                        style={{ borderWidth: "2px" }}
                                        onClick={() => {
                                          const updatedStops = cityObj.dham_stops.filter((_: any, i: number) => i !== stopIndex);
                                          formik.setFieldValue(`dham_pickup_cities.[${cityIndex}].dham_stops`, updatedStops);
                                        }}
                                      >
                                        <i
                                          className='bi bi-trash-fill text-danger'
                                        ></i>
                                      </div>
                                    </div>
                                  </div>

                                  {(formik.touched.dham_pickup_cities as any)?.[cityIndex]?.dham_stops?.[stopIndex]?.name &&
                                    (formik.errors.dham_pickup_cities as any)?.[cityIndex]?.dham_stops?.[stopIndex]?.name && (
                                      <div className="fv-plugins-message-container mt-1">
                                        <span className="text-danger" role="alert">
                                          {(formik.errors.dham_pickup_cities as any)[cityIndex].dham_stops[stopIndex].name}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              ))}
                              <div>
                                <span
                                  style={{ fontSize: "14px", fontWeight: "600", color: "var(--common-theme-color)" }}
                                  className="mt-3 cursor-pointer"

                                  onClick={() => {
                                    const updatedCities = [...formik.values.dham_pickup_cities];
                                    updatedCities[cityIndex].dham_stops = [
                                      ...(updatedCities[cityIndex].dham_stops || []),
                                      { name: '', description: '' }
                                    ];
                                    formik.setFieldValue("dham_pickup_cities", updatedCities);
                                  }}
                                >
                                  + Add Itinerary
                                </span>
                              </div>

                            </div>

                            <div className='col mt-3'>
                              <label className='fw-semibold fs-6 mb-2'>Pricing With Discount</label>
                              {cityObj.dham_pricings?.map((dhamObj: any, pricingIndex: number) => (
                                <div key={`dham_pickup_cities.${cityIndex}.dham_pricings.${pricingIndex}`}>
                                  <div className='row row-cols-2 g-1'>
                                    <div className='col-md-5'>
                                      <CustomSelect
                                        options={vehicle?.data?.map((Obj: any) => { return { 'label': Obj?.title, 'value': Obj?.id } })}
                                        value={dhamObj.vehicle_id}
                                        className={'form-control-solid w-100'}
                                        isMulti={undefined}
                                        onChange={(value: any) => { formik.setFieldValue('vehicle_id', value?.value); handleVehicleChange(value, cityIndex, pricingIndex) }}
                                        isLoading={vehicleLoading}
                                        isDisabled={false}
                                        placeholder='select vehicle...'
                                      />


                                      {(formik.touched.dham_pickup_cities as any)?.[cityIndex]?.dham_pricings?.[pricingIndex]?.vehicle_id &&
                                        (formik.errors.dham_pickup_cities as any)?.[cityIndex]?.dham_pricings?.[pricingIndex]?.vehicle_id && (
                                          <div className="fv-plugins-message-container mt-1">
                                            <span className="text-danger" role="alert">
                                              {(formik.errors.dham_pickup_cities as any)[cityIndex].dham_pricings[pricingIndex].vehicle_id}
                                            </span>
                                          </div>
                                        )}
                                    </div>

                                    <div className='col-md-3'>
                                      <input
                                        placeholder='Price'
                                        {...formik.getFieldProps(`dham_pickup_cities.[${cityIndex}].dham_pricings.[${pricingIndex}].price`)}
                                        className={clsx('form-control form-control-solid')}
                                        type='text'
                                        autoComplete='off'
                                        onBlur={(e) => formik.handleBlur(e)}
                                        disabled={formik.isSubmitting}
                                      />

                                      {(formik.touched.dham_pickup_cities as any)?.[cityIndex]?.dham_pricings?.[pricingIndex]?.price &&
                                        (formik.errors.dham_pickup_cities as any)?.[cityIndex]?.dham_pricings?.[pricingIndex]?.price && (
                                          <div className="fv-plugins-message-container mt-1">
                                            <span className="text-danger" role="alert">
                                              {(formik.errors.dham_pickup_cities as any)[cityIndex].dham_pricings[pricingIndex].price}
                                            </span>
                                          </div>
                                        )}
                                    </div>

                                    <div className='col-md-3'>
                                      <input
                                        placeholder='Discount'
                                        {...formik.getFieldProps(`dham_pickup_cities.[${cityIndex}].dham_pricings.[${pricingIndex}].discount`)}
                                        className={clsx('form-control form-control-solid')}
                                        type='text'
                                        autoComplete='off'
                                        onBlur={(e) => formik.handleBlur(e)}
                                        disabled={formik.isSubmitting}
                                      />

                                      {(formik.touched.dham_pickup_cities as any)?.[cityIndex]?.dham_pricings?.[pricingIndex]?.discount &&
                                        (formik.errors.dham_pickup_cities as any)?.[cityIndex]?.dham_pricings?.[pricingIndex]?.discount && (
                                          <div className="fv-plugins-message-container mt-1">
                                            <span className="text-danger" role="alert">
                                              {(formik.errors.dham_pickup_cities as any)[cityIndex].dham_pricings[pricingIndex].discount}
                                            </span>
                                          </div>
                                        )}
                                    </div>

                                    <div className='col-md-1 d-flex'>
                                      <div
                                        className='border border-danger w-100 text-center mb-1 mt-1 rounded-1 custom-delete-button d-flex justify-content-center align-items-center'
                                        style={{ borderWidth: "2px" }}
                                        onClick={() => {
                                          const updatedStops = cityObj.dham_pricings.filter((_: any, i: number) => i !== pricingIndex);
                                          formik.setFieldValue(`dham_pickup_cities.[${cityIndex}].dham_pricings`, updatedStops);
                                        }}
                                      >
                                        <i
                                          className='bi bi-trash-fill text-danger'
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='mb-1 d-flex align-items-center'>



                                  </div>

                                </div>
                              ))}
                              <div>
                                <span
                                  // type="button"
                                  style={{ fontSize: "14px", fontWeight: "600", color: "var(--common-theme-color)" }}
                                  className="mt-3 cursor-pointer"
                                  onClick={() => {
                                    const updatedCities = [...formik.values.dham_pickup_cities];
                                    updatedCities[cityIndex].dham_pricings = [
                                      ...(updatedCities[cityIndex].dham_pricings || []),
                                      { vehicle_id: '', price: '', discount: 0 }
                                    ];
                                    formik.setFieldValue("dham_pickup_cities", updatedCities);
                                  }}
                                >
                                  + Add Pricing
                                </span>
                              </div>

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
                      onClick={handleAddDhamPackageClick}
                      className='cursor-pointer'
                    >
                      + Add More Cities
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
