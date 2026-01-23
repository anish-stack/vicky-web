/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { ID, KTSVG, QUERIES } from '../../../../../../../_metronic/helpers'
import { useListView } from '../../core/ListViewProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'
import { deleteModel, deleteUser } from '../../core/_requests'
import { ToastComponent } from '../../../../../../../_metronic/helpers/components/ToastComponent'

type Props = {
  id: ID
}

const UserActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });


  const handleChange = (value: any) => {
    setShow(value);
  }

  // const deleteItem = useMutation(() => deleteUser(id), {
  //   onSuccess: () => {
      
  //     queryClient.invalidateQueries([`${QUERIES.LIST}-${query}`])
  //   },
  // })

  const deleteItem = useMutation(() => deleteModel(id), {
    onSuccess: (response: any, variables, context) => {
      if (response?.status == false) {
        setShow(true);
        setToastText({
          status: "danger",
          text: "User can not delete"
        })
        setMessage(response?.message);
      } else {
        setShow(true);
        setToastText({
          status: "success",
          text: response?.message
        })
        setMessage(response?.message);

      }
      queryClient.invalidateQueries([`${QUERIES.LIST}-${query}`])
    },
  })

  return (
    <>
     <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={show} onChange={handleChange} />
      <a
        href='#'
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Actions
        <KTSVG path='/media/icons/duotune/arrows/arr072.svg' className='svg-icon-5 m-0' />
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <Link to={`/apps/driver-management/edit/${id}`} className="menu-link px-3">Show</Link>
        </div>
        {/* end::Menu item */}

        {/* begin::Menu item */}
        {/* <div className='menu-item px-3'>
          <a
            className='menu-link px-3'
            onClick={async () => await deleteItem.mutateAsync()}
          >
            Delete
          </a>
        </div> */}
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { UserActionsCell }
