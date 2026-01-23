/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { MenuComponent } from '../../../../../../_metronic/assets/ts/components'
import { ID, KTSVG, QUERIES } from '../../../../../../_metronic/helpers'
import { useListView } from '../../../core/ListViewProvider'
import { useQueryResponse } from '../../../core/QueryResponseProvider'
import { deleteModel } from '../../../core/_requests'
import { useQueryRequest } from '../../../core/QueryRequestProvider'
import { ToastComponent } from '../../../../../../_metronic/helpers/components/ToastComponent'
type Props = {
  id: ID
}

const ActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [toastText, setToastText] = useState({
    status: "danger",
    text: "error"
  });

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  const deleteItem = useMutation(() => deleteModel(id), {
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: (response: any, variables, context) => {
      // ✅ update detail view directly
      if (response?.status == false) {
        console.log(response.message);
        setShow(true);
        setToastText({
          status: "danger",
          text: "Popular Locality can not delete"
        })
        setMessage(response?.message);
      } else {
        setShow(true);
        setToastText({
          status: "success",
          text: response.message
        })
        setMessage(response?.message);

      }
      queryClient.invalidateQueries([`${QUERIES.LIST}-${query}`])
    },
  })
  const { ModuleName } = useQueryRequest()
  const handleChange = (value: any) => {
    setShow(value);
  }
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
          <Link to={`/${ModuleName.slug}-management/edit/${id}`} className="menu-link px-3">Edit</Link>
        </div>
        {/* end::Menu item */}

        {/* begin::Menu item */}
        <div className='menu-item px-3'>

          <div
            className='menu-link px-3'
            data-kt-users-table-filter='delete_row'
            onClick={async () => await deleteItem.mutateAsync()}
          >
            Delete
          </div>
        </div>
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { ActionsCell }
