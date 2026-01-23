import {FC} from 'react'

type Props = {
  model: any
}

const InfoCell: FC<Props> = ({model}) => (
  <div className='d-flex align-items-center'>
    <div className='d-flex flex-column'>
      <a href='#' className='text-gray-800 text-hover-primary mb-1'>
      {model}
      </a>
    </div>
  </div>
)

export {InfoCell}
