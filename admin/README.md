# TaxiSafar Admin

Plain React 18 + Vite + Tailwind CSS v4. No Metronic, no Bootstrap, no react-query.

## Run

```bash
cp .env.example .env      # set VITE_API_URL to the API origin (no /api)
npm install
npm run dev               # http://localhost:3011
npm run build             # static files in dist/
```

Sign in with a `superadmin` account (email + password).

## Structure

```
src/
  lib/api.js          single axios instance: base URL, Bearer token, error unwrapping, auto-logout on 401
  lib/format.js       money, dates, booking code (TS001), places parsing, status labels
  context/            AuthContext (login / verifyToken / logout)
  hooks/useList.js    paginated list loader  ({data, payload.pagination})
  hooks/useOptions.js cached dropdown data (vehicles, cities, airports, categories)
  components/         ui kit, Layout (sidebar), Toast, PricingMatrix, PlaceSearch
  pages/              one file per screen
```

Every request goes through `lib/api.js`. The interceptor returns `response.data` directly and
rejects with the API `message` whenever the API answers `status: false` or a non-2xx code,
so pages only `try { await api.x() } catch (e) { toast.error(e) }`.

## Screens

| Menu | API |
|---|---|
| Dashboard | `GET /dashboard` (new) |
| Paid bookings, booking detail, invoice PDF, trip status + extra km/time | `/transaction` |
| Leads & trips (paid/unpaid, follow-up toggle, status) | `/trip` |
| Customers / Drivers | `/users?role=` |
| Vehicles (image, fares, one-way slabs, inclusions) | `/vehicles` |
| Cities (airport, pincodes, Excel import, default limits) + Date limits | `/cities`, `/booking_limit` |
| Airports, Local rental plans (city × vehicle fares) | `/airport`, `/localrentalplans` |
| Char Dham categories / packages (pickup cities, stops, fares) | `/dham_category`, `/dham_package` |
| Discounts: one way, round trip, local & airport | `/discount?slug=oneWay|roundTrip|local_airport` |
| Payment settings (advance %, toll tax) | `/advance_payment` |
