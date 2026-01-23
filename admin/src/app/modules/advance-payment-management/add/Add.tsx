import { FC, useState, useEffect } from 'react'
import { KTCard, KTCardBody, isNotEmpty, capitalize, ID } from '../../../../_metronic/helpers'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { initialModel, Model } from '../core/_models'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom';
import { ToastComponent } from '../../../../_metronic/helpers/components/ToastComponent'
import './style.css'
import { createModel, getModels, updateModel } from '../core/_requests'

type Props = {
  isLoading: boolean
  model: Model
  ModuleName: any
}

const validationSchema = Yup.object().shape({
  percentage: Yup.number()
    .typeError('Percentage must be a number')
    .required('Percentage is required')
    .min(0, 'Percentage cannot be negative')
    .max(99, 'Percentage must be less than 100')
    .test('not-negative', 'Percentage cannot be negative', (value: any) => value >= 0),
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
    percentage: model.percentage || initialModel.percentage,
    toll_tax: model.toll_tax || initialModel.toll_tax,
    roundtrip_toll_tax: model.roundtrip_toll_tax || initialModel.roundtrip_toll_tax,
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
        const data = await getModels(``) as any;
        if(data.status == true){
          formik.setFieldValue('percentage', data?.data?.percentage);
          formik.setFieldValue('toll_tax', data?.data?.toll_tax);
          formik.setFieldValue('roundtrip_toll_tax', data?.data?.roundtrip_toll_tax);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };

    fetchData();
  }, []);
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
                  <label className='required fw-semibold fs-6 mb-2'>{`Percentage`}</label>
                  <input placeholder={`Percentage`}
                    {...formik.getFieldProps('percentage')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.percentage && formik.errors.percentage },
                      {
                        'is-valid': formik.touched.percentage && !formik.errors.percentage,
                      }
                    )}
                    type='text' name='percentage' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.percentage && formik.errors.percentage && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.percentage}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Tall Tax`}</label>
                  <input placeholder={`Tall Tax`}
                    {...formik.getFieldProps('toll_tax')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.toll_tax && formik.errors.toll_tax },
                      {
                        'is-valid': formik.touched.toll_tax && !formik.errors.toll_tax,
                      }
                    )}
                    type='text' name='toll_tax' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.toll_tax && formik.errors.toll_tax && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.toll_tax}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col d-none">
                <div className='fv-row mb-7'>
                  <label className='required fw-semibold fs-6 mb-2'>{`Round Trip toll tax`}</label>
                  <input placeholder={`Round Trip toll tax`}
                    {...formik.getFieldProps('roundtrip_toll_tax')}
                    className={clsx(
                      'form-control form-control-solid mb-3 mb-lg-0',
                      { 'is-invalid': formik.touched.roundtrip_toll_tax && formik.errors.roundtrip_toll_tax },
                      {
                        'is-valid': formik.touched.roundtrip_toll_tax && !formik.errors.roundtrip_toll_tax,
                      }
                    )}
                    type='text' name='roundtrip_toll_tax' autoComplete='off' disabled={formik.isSubmitting} />

                  {formik.touched.roundtrip_toll_tax && formik.errors.roundtrip_toll_tax && (
                    <div className='fv-plugins-message-container'>
                      <span className='text-danger' role='alert'>{formik.errors.roundtrip_toll_tax}</span>
                    </div>
                  )}
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
