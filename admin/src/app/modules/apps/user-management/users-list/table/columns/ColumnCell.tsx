import {FC} from 'react'

type Props = {
  column_field?: string
}

const ColumnCell: FC<Props> = ({column_field}) => (
  <div className='badge badge-light fw-bold'>{column_field}</div>
)

export {ColumnCell}
