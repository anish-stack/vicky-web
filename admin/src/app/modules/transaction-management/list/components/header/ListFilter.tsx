import {useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../_metronic/assets/ts/components'
import {initialQueryState, KTSVG} from '../../../../../../_metronic/helpers'
import {useQueryRequest} from '../../../core/QueryRequestProvider'
import {useQueryResponse} from '../../../core/QueryResponseProvider'
import { CustomSelect } from '../../../../localrentalplan-management/add/select-react/CustomSelect'
import { getModels as getVehicles } from '../../../../vehicle-management/core/_requests'
import DateTimePicker from 'react-datetime-picker'

const ListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const [Show, setShow] = useState(false)
  const [tripStatus, setTripStatus] = useState<string | null>()
  const [tripType, setTripType] = useState<string | null>()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const resetData = () => {
    updateState({filter: undefined, ...initialQueryState})
  }

  const filterData = () => {
    updateState({
      filter: { tripStatus: tripStatus, tripType,vehicle_id: vehicleId, start_pickup_date: startPickupDate },
      ...initialQueryState,
    })
  }
  // const handleShow = () => setShow(true)

  const [vehicle, setVehicle] = useState() as any;
  const [vehicleId, setVehicleId] = useState() as any;
  
  const [vehicleLoading, setVehicleLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getVehicles('').then((result: any) => {
        setVehicle(result);
        setVehicleLoading(false);
      });
    })();
  }, [Show]);


  const [startPickupDate, setstartPickupDate] = useState() as any;
  useEffect(() => {
    console.log("filterData startPickupDate", startPickupDate)

    filterData();
  }, [tripStatus, vehicleId, startPickupDate, tripType]);

  return (
    <>
      {/* begin::Filter Button */}
      <div>
        <label className='form-label fs-6 fw-semibold w-200px'>Trip Status:</label>
        <CustomSelect
          className='form-select-solid'
          options={[
            { 'label': 'Reserved', 'value': 'reserved' },
            { 'label': 'Completed', 'value': 'completed' },
            { 'label': 'Active', 'value': 'active' },
            { 'label': 'Cancel', 'value': 'cancel' },
          ]}
          value={tripStatus}
          onChange={(e: any) => {
            if (e) {
              setTripStatus(e.value)
            } else {
              setTripStatus('')
            }
          }}

          isclearable={true}
          isMulti={undefined}
          isLoading={false}
        />
      </div>
      <div className='ms-4'>
        <label className='form-label fs-6 fw-semibold w-200px'>Trip Type:</label>
        <CustomSelect
          className='form-select-solid fs-8'
          options={[
            { 'label': 'One Way', 'value': 'oneway' },
            { 'label': 'Roundtrip', 'value': 'roundtrip' },
            { 'label': 'Local', 'value': 'local' },
            { 'label': 'Airport', 'value': 'airport' },
            { 'label': 'Chardham', 'value': 'chardham' },
          ]}
          value={tripType}
          onChange={(e: any) => {
            if (e) {
              setTripType(e.value)
            } else {
              setTripType('')
            }
          }}

          isclearable={true}
          isMulti={undefined}
          isLoading={false}
        />
      </div>
      <div className='mb-5 ms-4'>
        <label className='required fw-semibold fs-6 mb-2 w-225px '>Vehicle</label>
        <div className='fv-row'>
          <CustomSelect
            options={vehicle?.data?.map((Obj: any) => { return { 'label': Obj?.title, 'value': Obj?.id } })}
            value={vehicleId}
            className={'form-control-solid mb-3 mb-lg-0'}
            isMulti={undefined}
            onChange={(e: any) => {
              if (e) {
                setVehicleId(e.value)
              } else {
                setVehicleId('')
              }
            }}
            isLoading={vehicleLoading}
            isDisabled={false}
            isclearable={true}
          />

        </div>



      </div>
      <div className='mb-5 ms-4 w-225px'>

        <label className='fw-semibold fs-6 mb-2'>Start Pickup Date</label>

          <DateTimePicker
            className={'form-control-solid  form-control  mb-3 p-2 '    }
            onChange={(value: any) => {
              setstartPickupDate(value)
            }}
            // minDate={new Date()}
            // maxDate={new Date()}
            value={startPickupDate  ? new Date(startPickupDate as unknown as number): undefined}


            // value={((formik.values.expenses[index].limit_date) ? new Date(formik.values.expenses[index].limit_date) : null)}
            format='dd/MM/yyyy'
            name='limit_date'
            // disabled={formik.isSubmitting}
          />
                            
      </div>
      {/* <div className='mb-5 ms-4 w-225px'>

        <label className='fw-semibold fs-6 mb-2'>End Pickup Date</label>

        <DateTimePicker
          className={'form-control-solid  form-control  mb-3 p-2 '}
          onChange={(value: any) => {
            setendPickupDate(value)
          }}
          // minDate={new Date()}
          // maxDate={new Date()}
          value={ endPickupDate? new Date(endPickupDate as unknown as number) :undefined }
          // value={((formik.values.expenses[index].limit_date) ? new Date(formik.values.expenses[index].limit_date) : null)}
          format='dd/MM/yyyy'
          name='limit_date'
        // disabled={formik.isSubmitting}
        />

      </div> */}
      {/* <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3 '
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
        
        onClick={handleShow}
      >
        <KTSVG path='/media/icons/duotune/general/gen031.svg' className='svg-icon-2' />
        Filter
      </button> */}
      {/* end::Filter Button */}
      {/* begin::SubMenu */}
      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px'
        data-kt-menu-filter='true'
        >
      
        <div className='px-7 py-5'>
          <div className='fs-5 text-dark fw-bold'>Filter Options</div>
        </div>
        <div className='separator border-gray-200'></div>
     

        {/* begin::Content */}
        <div className='px-7 py-5' data-kt-table-filter='form'>
          {/* begin::Input group */}
          <div className='mb-4' data-kt-menu-dismiss='false'>
            <label className='form-label fs-6 fw-semibold'>Trip Status:</label>
            <CustomSelect
              className='form-select-solid'
              options={[
                { 'label': 'Reserved', 'value': 'reserved' },
                { 'label': 'Completed', 'value': 'completed' },
                { 'label': 'Active', 'value': 'active' },
                { 'label': 'Cancel', 'value': 'cancel' },
              ]}
              value={tripStatus}
              onChange={(e: any) => {
                if (e) {
                  setTripStatus(e.value)
                } else {
                  setTripStatus('')
                }
              }}
              // isclearable={true}
              isMulti={undefined}
              isLoading={false}
            />
          </div>
        
          {/* end::Input group */}

          {/* begin::Actions */}
          <div className='d-flex justify-content-end'>
            <button
              type='button'
              disabled={isLoading}
              onClick={resetData}
              className='btn btn-light btn-active-light-primary fw-semibold me-2 px-6'
              data-kt-menu-dismiss='true'
              data-kt-table-filter='reset'
            >
              Reset
            </button>
            <button
              disabled={isLoading}
              type='button'
              onClick={filterData}
              className='btn btn-primary fw-semibold px-6'
              data-kt-menu-dismiss='true'
              data-kt-table-filter='filter'
            >
              Apply
            </button>
          </div>
          {/* end::Actions */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::SubMenu */}
    </>
  )
}

export {ListFilter}
