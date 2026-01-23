/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import { FC } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { ErrorsPage } from '../modules/errors/ErrorsPage'
import { Logout, AuthPage, useAuth } from '../modules/auth'
import { App } from '../App'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { PUBLIC_URL } = process.env

const AppRoutes: FC = () => {
  const { currentUser } = useAuth();

  let userRoutes

  // if (currentUser?.user?.role == 'superadmin' || currentUser?.user?.role == 'admin') {
  //   userRoutes = (
  //     <>
  //       <Route path="/*" element={<PrivateRoutes />} />
  //       <Route index element={<Navigate to="/pagecontent-management/list" />} />
  //     </>
  //   )
  // } else if (currentUser?.user?.role == 'data_entry_operator') {
  //   userRoutes = (
  //     <>
  //       <Route path="/*" element={<PrivateRoutes />} />
  //       <Route index element={<Navigate to="/property-management/list" />} />
  //     </>
  //   )
  // } else {
  //   userRoutes = (
  //     <>
  //       <Route path="auth/*" element={<AuthPage />} />
  //       <Route path="*" element={<Navigate to="/auth" />} />
  //     </>
  //   )
  // }
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
          {currentUser ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              <Route index element={<Navigate to='/apps/user-management/list' />} />
            </>
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
          {/* {userRoutes} */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { AppRoutes }
