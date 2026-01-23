import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UserAddWrapper} from './users-add/UserAddWrapper'
import {UsersListWrapper} from './users-list/UsersList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Driver Management',
    path: '/apps/driver-management/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const UsersPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Drivers list</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>

      <Route element={<Outlet />}>
        <Route
          path='add'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Add New User</PageTitle>
              <UserAddWrapper/>
            </>
          }
        />
      </Route>

      <Route element={<Outlet />}>
        <Route
          path='edit/:id'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Show Driver Details</PageTitle>
              <UserAddWrapper/>
            </>
          }
        />
      </Route>

      <Route index element={<Navigate to='/apps/driver-management/users' />} />
    </Routes>
  )
}

export default UsersPage
