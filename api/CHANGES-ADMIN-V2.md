# API changes for Admin v2

## Security
- New `middlewares/adminMiddleware.js`: verifies JWT **and** loads the user from DB, requires role `superadmin`.
  Works with old admin tokens (they had no role claim).
- New `middlewares/selfOrAdmin.js`: own record or admin.
- Admin-only now: all create/update/delete on vehicles (previously had **no auth at all**), cities, pincode import,
  airports, rental plans, dham categories/packages, discounts, advance payment, booking limits,
  `PUT /transaction/:id`, trip convert/unconvert/status/complete, `GET /users`, `DELETE /users/:id`, `GET /session`.
- `POST /users`: public only for `role: customer`; any other role (driver, superadmin) needs an admin token.
  Before, anyone could create a superadmin.
- `GET /users/:id` and `PUT /users/:id`: token required, self or admin (were public).
- `GET /trip`: token required; customers get only their own trips. `PATCH /trip/:id/cancel`: token, customers only their own.
- `GET /transaction`: customers get only their own rows.
- Password hashes removed from `verifyToken`, `GET /users`, `GET /users/:id`, create/update responses.
- Admin login token now carries `role`.
- Removed boot log that printed the Razorpay LIVE key id and part of the secret (`paymentController.js`).
- Auth runs before multer on upload routes, so unauthenticated uploads never touch disk.

## Bugs fixed
- Trip status endpoints used `ongoing`/`cancelled`, which the DB ENUM (`active, reserved, completed, cancel`) rejects.
  Aligned; status changes also sync `transactions.trip_status`.
- Trip list search queried a non-existent `invoice_id` column → now searches id (`TS123`), customer name, phone.
  New filters: `trip_type`, `car_tab`, `converted`, `paid`.
- Transaction list search also matches name, contact, payment id; new `filter_trip_type`, `filter_car_tab`.
- `PUT /transaction/:id` validates status; no crash when the trip row is missing.
- `updateUser` crashed on every call (`$ne` operator alias unsupported in Sequelize 6). Admin can now set phone, role, password.
- City update crashed when `booking_limits` was missing; create required an airport and ignored pincodes/limits.
  Shared sync for pincodes + default limits (0 = remove limit). Pincode uniqueness checked across all cities
  (column is globally unique). Delete also removes pincodes and limits. Excel import checks duplicates globally.
- Booking-limit PUT deleted the city's default (no-date) limits; now manages dated limits only. GET returns dated limits only.
  `check_booking_available` no longer crashes on unknown pincode. Removed broken unused `getBookingLimit`.
- `GET /advance_payment` crashed when no row existed. Removed implicit global `message`.
- Rental plan: edit returned 404 for plans without fares; delete now removes fares; list sorted by hours.
- Dham package: sending an empty pickup-city list did nothing; removed cities left stops/pricings orphaned;
  delete cascades; bad JSON returns 400.
- Vehicle: create ignored `additional_time_charge`; delete checks rental, airport and dham pricing usage.

## New
- `GET /api/dashboard` (admin): booking counts by status, today, revenue totals (all time + month),
  open leads, entity counts, 14-day chart, latest 8 bookings.
- JSON 404 for unknown `/api/*` routes and a JSON error handler (upload type errors → 400).
- Image uploads accept WebP.

## Check before deploy
The customer website must send `Authorization: Bearer <token>` on: `GET /api/trip`, `GET/PUT /api/users/:id`,
`PATCH /api/trip/:id/cancel`. Customer tokens from OTP login already work.
