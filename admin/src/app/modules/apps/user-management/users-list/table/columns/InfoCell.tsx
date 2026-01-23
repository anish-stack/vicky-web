/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
// import {toAbsoluteUrl} from '../../../../../../../_metronic/helpers'

type Props = {
  column_field?: string
}

const InfoCell: FC<Props> = ({column_field}) => (
 <>
  <div className='d-flex align-items-center'>
    <div className='d-flex flex-column'>
      <a href='#' className='asasass text-gray-800 text-hover-primary mb-1'>
      {column_field} 
      </a>
    </div>
    
  </div>
  </>
  
)

export {InfoCell}
