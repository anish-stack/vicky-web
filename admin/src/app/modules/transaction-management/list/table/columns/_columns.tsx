import {Column} from 'react-table'
import {InfoCell} from './InfoCell'
import {ActionsCell} from './ActionsCell'
import {SelectionCell} from './SelectionCell'
import {CustomHeader} from './CustomHeader'
import {SelectionHeader} from './SelectionHeader'
import {Model} from '../../../core/_models'
import { AddressCell } from './AddressCell'
import { DateCell } from './DateCell'
import { Link } from 'react-router-dom'
import { KTSVG } from '../../../../../../_metronic/helpers'
import { BudgeInfoCell } from './BudgeInfoCell'

const tableColumns: ReadonlyArray<Column<Model>> = [
  // {
  //   Header: (props) => <SelectionHeader tableProps={props} />,
  //   id: 'selection',
  //   Cell: ({...props}) => <SelectionCell id={props.data[props.row.index].id} />,
  // },
  {
    Header: (props) => <CustomHeader tableProps={props} title='No' className='w-50px' />,
    id: 'index_no',
    Cell: ({ ...props }) => <InfoCell model={props.data[props.row.index].index_no} />,
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='BookingId' className='min-w-100px' />,
    id: 'booking_id',
    Cell: ({ ...props }) => <BudgeInfoCell bg_color='primary' model={`TS${String(props.data[props.row.index].trip_id || 0).padStart(3, '0')}`} />,
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Vehicle Name' className='min-w-125px' />,
    id: 'vehicle_name',
    Cell: ({ ...props }) => <InfoCell model={props.data[props.row.index].vehicle_name} />,
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Trip Type' className='min-w-25px' />,
    id: 'trip_type',
    Cell: ({ ...props }) => <BudgeInfoCell bg_color='success' model={props.data[props.row.index].car_tab === 'chardham' ? 'Chardham' : props.data[props.row.index].trip_type?.toUpperCase()} />,
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Pickup & Drop Location ' className='min-w-350px' />,
    id: 'pickup_address',
    Cell: ({ ...props }) => <AddressCell places={props.data[props.row.index].places} dham_package_name={props.data[props.row.index].dham_package_name ||''} dham_pickup_city_name={props.data[props.row.index].dham_pickup_city_name} cartab={props.data[props.row.index].car_tab === 'chardham' ?'chardham':'taxi'} />,
  }, 
  {
    Header: (props) => <CustomHeader tableProps={props} title='Pickup Time ' className='min-w-150px' />,
    id: 'departure_date',
    Cell: ({ ...props }) => <DateCell model={props.data[props.row.index].departure_date} return_date={props.data[props.row.index].return_date} />,
  }, 
  {
    Header: (props) => <CustomHeader tableProps={props} title='TripFair  ' className='max-w-125px' />,
    id: 'original_amount',
    Cell: ({ ...props }) => <InfoCell model={props.data[props.row.index].original_amount} />,
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Trip Status' className='min-w-125px' />,
    id: 'trip_status',
    Cell: ({ ...props }) => <InfoCell model={props.data[props.row.index].trip_status?.toUpperCase()} />,
  },


  // <div className={`badge badge-${bg_color}`}>
  //   {model ? formatDate(model) : ''}
  // </div >


  // {
  //   Header: (props) => <CustomHeader tableProps={props} title='Paid Amount' className='min-w-125px' />,
  //   id: 'paid_amount',
  //   Cell: ({ ...props }) => <InfoCell model={props.data[props.row.index].paid_amount} />,
  // },
  // {
  //   Header: (props) => <CustomHeader tableProps={props} title='Invoice Id' className='min-w-125px' />,
  //   id: 'invoice_id',
  //   Cell: ({...props}) => <InfoCell model={props.data[props.row.index].invoice_id} />,
  // },
  // {
  //   Header: (props) => <CustomHeader tableProps={props} title='Payment Id' className='min-w-125px' />,
  //   id: 'payment_id',
  //   Cell: ({...props}) => <InfoCell model={props.data[props.row.index].payment_id} />,
  // },
  {
    Header: (props) => (
      <CustomHeader tableProps={props} title='View' className='text-end min-w-25px' />
    ),
    id: 'view',
    Cell: ({ ...props }) => {
      const rowData = props.data[props.row.index];
      const id = rowData.id;
     

      return (
        <div className="text-end">
          <Link to={`/transaction-management/edit/${id}`} className="menu-link px-3">
            <i className="bi bi-eye-fill text-primary fs-2x"></i>
          </Link>
        </div>
      );
    },
  },
  // {
  //   Header: (props) => (
  //     <CustomHeader tableProps={props} title='Actions' className='text-end min-w-100px' />
  //   ),
  //   id: 'actions',
  //   Cell: ({...props}) => <ActionsCell id={props.data[props.row.index].id} />,
  // },
]


export {tableColumns}