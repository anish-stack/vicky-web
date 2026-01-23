import {capitalize, KTSVG} from '../../../../../../_metronic/helpers'
import {ListFilter} from './ListFilter'
import {Link} from 'react-router-dom'
import { useQueryRequest } from '../../../core/QueryRequestProvider'

const ListToolbar = () => {

  const {ModuleName} = useQueryRequest()

  return (
    <div className='d-flex justify-content-end' data-kt-table-toolbar='base'>
      <ListFilter />
      
      {/* <Link to={`/${ModuleName.slug}-management/add`} className="btn btn-primary"><KTSVG path='/media/icons/duotune/arrows/arr075.svg' className='svg-icon-2' />
        {`Add ${capitalize(ModuleName.singular)}`}</Link> */}

    </div>
  )

}

export {ListToolbar}
