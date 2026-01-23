import {FC} from 'react'

type Props = {
  username?: string
}

const UserLastLoginCell: FC<Props> = ({username}) => (
  <div className='badge badge-light fw-bold'>{username}</div>
)

export {UserLastLoginCell}
