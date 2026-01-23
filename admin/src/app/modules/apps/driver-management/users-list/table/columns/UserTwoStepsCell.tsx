import {FC} from 'react'

type Props = {
  mobile_no?: string
}

const UserTwoStepsCell: FC<Props> = ({mobile_no}) => (
  <div className='badge badge-light fw-bold'>{mobile_no}</div>
)

export {UserTwoStepsCell}
