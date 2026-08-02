# TaxiSafar API v2 — Express + MongoDB

Complete rewrite of the legacy `vicky-cabs-backend` (Express + Sequelize + MySQL).
Same business rules, new data layer, hardened auth and payments.

**The fare formula is unchanged.** It was ported byte-for-byte from the live
client-side calculation in `pages/vehicles.tsx` into `src/services/pricing.service.js`.
Every `Math.floor` / `Math.round` / `Math.max` sits exactly where it did before,
so existing quotes reproduce to the rupee. Do not refactor that file.

---

## Quick start

```bash
cp .env.example .env      # fill MONGO_URI, JWT secrets, Razorpay & Google keys
npm install
npm run seed              # demo data (add --fresh via npm run seed:fresh to wipe first)
npm run dev               # http://localhost:5000
```

Health check: `GET /health`

Seeded admin: `admin@taxisafar.com` / `Admin@12345`

---

## Migrating live MySQL data

```bash
npm i mysql2
MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD=secret MYSQL_DB=vickycabs \
  npm run migrate:mysql
```

Idempotent — re-running updates rather than duplicating. Legacy bcrypt password
hashes are **not** copied (different cost/format); password users must reset.
OTP login is unaffected, which covers every customer account.

---

## What changed vs the old backend

| Area | Before | Now |
|---|---|---|
| Fare calculation | in the browser, trivially tamperable | server-side, single source of truth |
| Payment amount | sent from the client in the request body | derived from the stored trip/booking |
| Payment confirmation | trusted the checkout callback | HMAC signature verify + Razorpay webhook |
| Auth | long-lived JWT only | short access token + rotating refresh cookie with reuse detection |
| OTP | plaintext row in the DB, no attempt cap | bcrypt-hashed, TTL-indexed, attempt + rate limited |
| Google Maps key | exposed to the browser | server-side proxy under `/api/maps` |
| Site content | hardcoded in the frontend | `Content` / `Destination` / `Service` / `Testimonial` collections |
| Tour packages | did not exist | full `TourPackage` module with a 3-step booking flow |

---

## Data model

**Fleet & pricing** — `Vehicle`, `OneWayTripPricing` (distance slabs),
`AirportPricing`, `LocalRentalPlan`, `LocalRentalPricing`, `AdvancePayment`,
`Setting` (`toll_tax`, `roundtrip_toll_tax`).

Vehicle keeps the legacy column names (`priceperkm`, `driver_expences`,
`perdaystatetaxcharges`, `minimum_price_range`) precisely because the pricing
service reads them — renaming would silently change fares.

**Geography** — `City`, `Pincode`, `Airport`.

**Offers & capacity** — `Discount` (city rules, trip types and per-vehicle
percentages embedded as subdocuments instead of four join tables), `BookingLimit`.

**Char Dham** — `DhamCategory`, `DhamPackage` (routes, pickup cities, per-city
pricing and stops all embedded — six tables collapsed into one document).

**Tour packages** — `TourPackage` (itinerary days, places covered, inclusions,
exclusions, notes, FAQs, vehicle options, hotel options), `Hotel`, `TourBooking`.

**Booking flow** — `Session` (search state), `Trip` (enquiry/booking),
`Transaction` (payment).

**CMS** — `Content` (page sections), `Destination`, `Service`, `Testimonial`,
`Faq`, `Media`, `Newsletter`, `Enquiry`.

---

## API

All responses: `{ status, message, data, meta? }`. Errors: `{ status: false, message, errors? }`.

### Auth — `/api/auth`
| Method | Path | Notes |
|---|---|---|
| POST | `/send-otp` | WhatsApp OTP via MyOperator; 6 per 10 min per IP+phone |
| POST | `/verify-otp` | logs in, creates the customer on first use |
| POST | `/login` | email + password (staff) |
| POST | `/refresh` | rotates the httpOnly refresh cookie |
| POST | `/logout` | revokes the refresh token |
| GET/PUT | `/me` | profile |

In development the OTP is returned as `devCode` and logged, so you can test
without a live WhatsApp gateway.

### Search → quote → book
| Method | Path | Notes |
|---|---|---|
| POST | `/api/sessions` | create a search session (3h pickup + 1h drop rules enforced) |
| GET | `/api/sessions/:sessionId` | |
| GET | `/api/quote/:sessionId?tax_included=true` | **fares for every eligible vehicle** |
| GET | `/api/quote/settings` | advance % and toll rates |
| POST | `/api/quote/check-availability` | booking-limit check |
| POST | `/api/trips` | freeze a quote into a trip (guests allowed) |
| GET | `/api/trips`, `/api/trips/:id` | auth |
| PATCH | `/api/trips/:id/cancel`, `/:id/status` | |

`GET /api/quote/:sessionId` returns each vehicle with `computedPrice`,
`computedKm`, `discount`, `discountPrice`, `advancePrice` and `availability`,
sorted cheapest-first — exactly the shape the old results page consumed.

Round trips use `roundtrip_toll_tax`; everything else uses `toll_tax`.

### Tour packages — `/api/packages`
| Method | Path | Notes |
|---|---|---|
| GET | `/` | card grid, paginated, filter by `from`, `days`, `tripType`, `featured` |
| GET | `/slugs` | for `getStaticPaths` and the sitemap |
| GET | `/:slug` | full detail: itinerary, places, inclusions, FAQs, vehicles, hotels |
| GET | `/:slug/related`, `/:slug/hotels` | |
| POST | `/quote` | server-priced summary for the booking screen |
| POST | `/book` | creates a `TourBooking` |
| GET | `/bookings`, `/bookings/:id` | |

Prices are always recomputed from the stored package — the client never supplies a total.

### Payments — `/api/payments`
| Method | Path | Notes |
|---|---|---|
| POST | `/create-order` | pass `trip` **or** `tourBooking`; the amount comes from the DB |
| POST | `/verify` | HMAC signature check, then fetches the payment from Razorpay |
| POST | `/failed` | records a declined attempt |
| POST | `/webhook` | raw-body HMAC; mounted before the JSON parser |
| GET | `/`, `/:id` | |

Set `RAZORPAY_WEBHOOK_SECRET` and point the Razorpay dashboard at
`POST /api/payments/webhook` for `payment.captured`, `payment.authorized` and
`payment.failed`. The webhook is the authoritative confirmation — the browser
callback is a convenience.

Test keys are used automatically unless `NODE_ENV=production`.

### Catalog (public read, staff write)
`/api/cities` · `/api/airports` · `/api/vehicles` · `/api/local-rental-plans` ·
`/api/destinations` · `/api/services` · `/api/testimonials` · `/api/faqs` ·
`/api/hotels` · `/api/dham-categories` · `/api/dham-packages`

Each supports `GET /`, `GET /:id-or-slug`, `POST /`, `PUT /:id`, `DELETE /:id`
with `?page`, `?items_per_page`, `?search`, `?isActive`.

Extras: `/api/cities/serviceable?pincode=`, `/api/cities/:id/pincodes`,
`/api/local-rental-plans/by-city?city=`.

### Content & SEO
| Method | Path | Notes |
|---|---|---|
| GET | `/api/bootstrap` | settings + cities + plans + airports + dham data in one call |
| GET | `/api/content/:page` | page sections, hydrated with destinations/services/testimonials |
| GET | `/api/sitemap-data` | slugs + `updatedAt` for `sitemap.xml` |
| GET/PUT | `/api/settings` | |
| POST | `/api/newsletter`, `/api/enquiries` | |

`/api/bootstrap` exists so the frontend shell needs one request instead of six.

### Maps proxy — `/api/maps`
`autocomplete` · `locality` · `pincode` · `route` · `distance-matrix`.
`POST /api/maps/route` takes `{ places: [place_id, ...] }` and returns total
driving `distanceKm` across all waypoints — that value feeds the session.

### Media — `/api/media`
`POST /api/media/:folder` (field `files`, up to 10, 6 MB each, staff only).
Served from `/uploads/**`. Package, hotel and destination images all upload here.

---

## Security notes

- Helmet, CORS allow-list, `express-mongo-sanitize`, compression.
- Rate limits: 240 req/min general, 6 OTP/10 min, 20 auth attempts/15 min, 120 maps/min.
- Refresh tokens are hashed at rest; reusing a revoked one revokes the whole family.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` and `MONGO_URI` are mandatory in production — the process refuses to boot without them.
- Ownership is enforced on trips, bookings and transactions; staff bypass via role.

## Layout

```
src/
  config/      env + mongo connection
  models/      31 Mongoose schemas
  services/    pricing (ported), discount, otp, token, razorpay, maps
  controllers/ auth, session, quote, trip, tourPackage, payment, catalog, content, maps, media
  routes/      112 endpoints
  middleware/  auth, validate, upload, rateLimit, error
  seed/        seed.js + migrate-mysql.js
```
