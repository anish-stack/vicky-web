import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { MenuTestPage } from '../pages/MenuTestPage'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import { useAuth } from '../modules/auth'

const PrivateRoutes = () => {
	const { currentUser } = useAuth();

	const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
	const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
	const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
	const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
	const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
	const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
	const DriverPage = lazy(() => import('../modules/apps/driver-management/UsersPage'))
	const VehiclePage = lazy(() => import('../modules/vehicle-management/MainPage'))
	const TransactionPage = lazy(() => import('../modules/transaction-management/MainPage'))
	const LocalRentalPlanPage = lazy(() => import('../modules/localrentalplan-management/MainPage'))
	const CityPage = lazy(() => import('../modules/city-management/MainPage'))
	const AirportPage = lazy(() => import('../modules/airport-management/MainPage'))
	const AdvancePaymentPage = lazy(() => import('../modules/advance-payment-management/MainPage'))
	const DhamPackagePage = lazy(() => import('../modules/dhampackage-management/MainPage'))
	const DhamCategoryPage = lazy(() => import('../modules/dhamcategory-management/MainPage'))
	const DiscountPage = lazy(() => import('../modules/discount-management/MainPage'))
	const DiscountLocalAirportPage = lazy(() => import('../modules/discount-local-airport-management/MainPage'))
	const DiscountRoundTripPage = lazy(() => import('../modules/discount-roundtrip-management/MainPage'))

	return (
		<Routes>
			<Route element={<MasterLayout />}>

				<Route path='auth/*' element={<Navigate to='/apps/user-management/list' />} />
				<Route path='dashboard' element={<DashboardWrapper />} />
				<Route path='builder' element={<BuilderPageWrapper />} />
				<Route path='menu-test' element={<MenuTestPage />} />

				<>
					<Route
						path='crafted/pages/profile/*'
						element={
							<SuspensedView>
								<ProfilePage />
							</SuspensedView>
						}
					/>
					<Route
						path='crafted/pages/wizards/*'
						element={
							<SuspensedView>
								<WizardsPage />
							</SuspensedView>
						}
					/>
					<Route
						path='crafted/widgets/*'
						element={
							<SuspensedView>
								<WidgetsPage />
							</SuspensedView>
						}
					/>
					<Route
						path='crafted/account/*'
						element={
							<SuspensedView>
								<AccountPage />
							</SuspensedView>
						}
					/>
					<Route
						path='apps/chat/*'
						element={
							<SuspensedView>
								<ChatPage />
							</SuspensedView>
						}
					/>
					<Route
						path='apps/user-management/*'
						element={
							<SuspensedView>
								<UsersPage />
							</SuspensedView>
						}
					/>

					<Route
						path='apps/driver-management/*'
						element={
							<SuspensedView>
								<DriverPage />
							</SuspensedView>
						}
					/>

					<Route
						path='vehicle-management/*'
						element={
							<SuspensedView>
								<VehiclePage />
							</SuspensedView>
						}
					/>

					<Route
						path='transaction-management/*'
						element={
							<SuspensedView>
								<TransactionPage />
							</SuspensedView>
						}
					/>

					<Route
						path='localrentalplan-management/*'
						element={
							<SuspensedView>
								<LocalRentalPlanPage />
							</SuspensedView>
						}
					/>

					<Route
						path='city-management/*'
						element={
							<SuspensedView>
								<CityPage />
							</SuspensedView>
						}
					/>

					<Route
						path='airport-management/*'
						element={
							<SuspensedView>
								<AirportPage />
							</SuspensedView>
						}
					/>

					<Route
						path='advance-payment-management/*'
						element={
							<SuspensedView>
								<AdvancePaymentPage />
							</SuspensedView>
						}
					/>


					<Route
						path='discount-management/*'
						element={
							<SuspensedView>
								<DiscountPage />
							</SuspensedView>
						}
					/>

					<Route
						path='discount-local-airport-management/*'
						element={
							<SuspensedView>
								<DiscountLocalAirportPage />
							</SuspensedView>
						}
					/>


					<Route
						path='discount-roundtrip-management/*'
						element={
							<SuspensedView>
								<DiscountRoundTripPage />
							</SuspensedView>
						}
					/>


					<Route
						path='dhampackage-management/*'
						element={
							<SuspensedView>
								<DhamPackagePage />
							</SuspensedView>
						}
					/>


					<Route
						path='dhamcategory-management/*'
						element={
							<SuspensedView>
								<DhamCategoryPage />
							</SuspensedView>
						}
					/>



				</>

				<Route path='*' element={<Navigate to='/error/404' />} /></Route>
		</Routes>
	)
}

const SuspensedView: FC<WithChildren> = ({ children }) => {
	const baseColor = getCSSVariableValue('--kt-primary')
	TopBarProgress.config({
		barColors: {
			'0': baseColor,
		},
		barThickness: 1,
		shadowBlur: 5,
	})
	return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export { PrivateRoutes }