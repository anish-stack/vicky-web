import { MenuItem } from './MenuItem'
import { MenuInnerWithSub } from './MenuInnerWithSub'
// import {MegaMenu} from './MegaMenu'
import { useIntl } from 'react-intl'
import { useAuth } from '../../../../app/modules/auth'

export function MenuInner() {
	const intl = useIntl()
	const { currentUser, logout } = useAuth()

	return (
		<>
			<MenuItem to='/apps/user-management/list' title='Customers' />
			<MenuItem to='/apps/driver-management/list' title='Drivers' />
			<MenuItem to='/vehicle-management/list' title='Vehicles' />
			<MenuItem to='/transaction-management/list' title='Booking' />
			{/* <MenuItem to='/airport-management/list' title='Airport' /> */}
			<MenuItem to='/city-management/list' title='City' />
			<MenuItem to='/advance-payment-management/add' title='Advance Payment' />
			
			<MenuInnerWithSub isMega={true} title='Dham' to='/mega-menu' menuPlacement='bottom-start' menuTrigger='click'>
				<div className='row' data-kt-menu-dismiss='true'>
					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/dhamcategory-management/list'
									title='Dham Category'
								/>
							</div>
						</div>
					</div>

					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/dhampackage-management/list'
									title='Dham Package'
								/>
							</div>
						</div>
					</div>
				</div>


			</MenuInnerWithSub>
			{/* <MenuItem to='/dhampackage-management/list' title='Dham Package' /> */}

			<MenuInnerWithSub isMega={true} title='Pricing' to='/mega-menu' menuPlacement='bottom-start' menuTrigger='click'>
				<div className='row' data-kt-menu-dismiss='true'>
					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/localrentalplan-management/list'
									title='Local Rental Plan'
								/>
							</div>
						</div>
					</div>

					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/airport-management/list'
									title='Airport'
								/>
							</div>
						</div>
					</div>
				</div>


			</MenuInnerWithSub>

			<MenuInnerWithSub isMega={true} title='Discounts' to='/mega-menu' menuPlacement='bottom-start' menuTrigger='click'>
				<div className='row' data-kt-menu-dismiss='true'>
					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/discount-management/add'
									title='One Way'
								/>
							</div>
						</div>
					</div>

					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/discount-roundtrip-management/add'
									title='Round Trip'
								/>
							</div>
						</div>
					</div>

					<div className='col-lg-12 border-left-lg-1'>
						<div className='menu-inline menu-column menu-active-bg'>
							<div className='menu-item'>
								<MenuItem
									icon='/media/icons/duotune/general/gen051.svg'
									to='/discount-local-airport-management/add'
									title='Local / Airport'
								/>
							</div>
						</div>
					</div>

				</div>
			</MenuInnerWithSub>
			{/* <MenuItem to='/discount-management/add' title='Discount' /> */}

		</>
	)
}
