import {KTSVG} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {UsersListFilter} from './UsersListFilter'
import {Link} from 'react-router-dom'
import React from 'react'
import Select from 'react-select'
import ColumnSelect from './ColumnSelect'

const UsersListToolbar = () => {
  const {setItemIdForUpdate} = useListView()
  const openAddUserModal = () => {
    setItemIdForUpdate(null)
  }
 

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      {/* <ColumnSelect /> */}

      <UsersListFilter />
    

     

      {/* <Link to="/apps/driver-management/add" className="btn btn-primary"><KTSVG path='/media/icons/duotune/arrows/arr075.svg' className='svg-icon-2' />
        Add User</Link> */}

      {/* end::Add user */}
    </div>
  )
}

export {UsersListToolbar}
