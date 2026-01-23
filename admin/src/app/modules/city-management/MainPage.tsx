import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { capitalize } from '../../../_metronic/helpers';
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import { AddWrapper } from './add/AddWrapper'
import { ListWrapper } from './list/List'

const ModuleName = { singular: 'city', plural: 'cities', slug: 'city' };

const Breadcrumbs: Array<PageLink> = [
  {
    title: `${capitalize(ModuleName.singular)} Management`,
    path: `/${ModuleName.slug}-management/list`,
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

const MainPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={Breadcrumbs}>{`${capitalize(ModuleName.singular)} list`}</PageTitle>
              <ListWrapper />
            </>
          }
        />
      </Route>

      <Route element={<Outlet />}>
        <Route
          path='add'
          element={
            <>
              <PageTitle breadcrumbs={Breadcrumbs}>{`Add New ${ModuleName.singular}`}</PageTitle>
              <AddWrapper ModuleName={ModuleName} />
            </>
          }
        />
      </Route>

      <Route element={<Outlet />}>
        <Route
          path='edit/:id'
          element={
            <>
              <PageTitle breadcrumbs={Breadcrumbs}>{`Edit ${ModuleName.singular}`}</PageTitle>
              <AddWrapper ModuleName={ModuleName} />
            </>
          }
        />
        <Route
          path='edit/:id/:tab'
          element={
            <>
              <PageTitle breadcrumbs={Breadcrumbs}>{`Edit ${ModuleName.singular}`}</PageTitle>
              <AddWrapper ModuleName={ModuleName} />
            </>
          }
        />
      </Route>

      <Route index element={<Navigate to={`/${ModuleName.slug}-management/list`} />} />
    </Routes>
  )
}

export default MainPage
