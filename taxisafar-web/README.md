# TaxiSafar Web v2 — Next.js 14 + Tailwind

Frontend rewrite. Pages Router, Tailwind only, every screen fed by the
TaxiSafar API v2 (`taxisafar-api`). No second backend, no hardcoded copy.

```bash
cp .env.example .env      # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL
npm install
npm run dev               # http://localhost:3000
```

Start the API first and run `npm run seed` there, otherwise pages render their
empty states.

---

## `src/themes` is untouched

`src/themes/**` and `context/WebsiteContext.tsx` were copied over byte-for-byte.
They still call the separate driver-website backend, exactly as before. They are
excluded from lint (`.eslintrc.json`) so their existing warnings don't block
your builds.

`framer-motion` is in `package.json` only because those themes import it.

Route: `/[slug]` → `WebsiteProvider` → `ThemeRenderer`. Everything else in the
app uses `NEXT_PUBLIC_API_URL` and nothing else.

---

## Pages

| Route | Rendering | Source |
|---|---|---|
| `/` `/chardham` `/hotel` | ISR 300s | `/content/home?tab=…` + `/bootstrap` |
| `/packages` | ISR 300s | `/packages` |
| `/packages/[slug]` | ISR 300s, `fallback: blocking` | `/packages/:slug` |
| `/packages/[slug]/book` | ISR 300s | `/packages/quote` → `/packages/book` |
| `/vehicles` | client fetch | `/quote/:sessionId` |
| `/booking/[id]` | client fetch | `/trips/:id` |
| `/contact` `/faq` | ISR 600s | `/enquiries`, `/faqs` |
| `/sitemap.xml` `/robots.txt` | SSR, cached 1h / 24h | `/sitemap-data` |

New packages appear without a redeploy — `fallback: "blocking"` renders them on
first request, then ISR keeps them warm.

---

## Everything is dynamic

Nothing on the home page is hardcoded. `/content/home` returns ordered sections
and `components/home/SectionRenderer.tsx` maps `sectionType` to a component:

`hero` · `popularDestinations` · `aboutUs` · `featureAccordion` · `services` ·
`testimonials` · `partnerCards`

Reorder or retitle sections in the backend and the page follows. Unknown types
render nothing, so adding a new type is additive and safe.

Images come from the API's `/uploads/**`. `lib/format.ts#mediaUrl` resolves
relative paths against the API host, so package, hotel and destination images
are all managed from the backend. The SVGs in `public/images` are placeholders
for the three hero slots until real photos are uploaded.

---

## Booking flows

**Taxi / Char Dham** — search widget → `POST /sessions` → `/vehicles?session=…`
→ `GET /quote/:sessionId` → `POST /trips` → `/booking/[id]` → Razorpay.

`/vehicles` refetches when the Best Price ↔ Toll & State Tax Inclusive tab
changes, so the toggle always reflects a server-computed fare. The card
breakdown, discount strike-through and sold-out state all come from the quote.

**Tour packages** — `/packages` → three-step detail (Overview → Itinerary →
Prices) → `/packages/[slug]/book` → `POST /packages/quote` for a live total →
`POST /packages/book` → Razorpay.

The price summary is always the server's response. `lib/payment.ts` sends only
the booking id to `/payments/create-order`; the amount comes from the database.

---

## Auth

`context/AuthContext.tsx` holds the access token in memory + `sessionStorage`,
with the refresh token in an httpOnly cookie. `lib/api.ts` retries a 401 once
through `/auth/refresh` and de-duplicates concurrent refreshes.

Customers sign in with a WhatsApp OTP (`LoginModal`) — no password. Booking is
allowed while signed out up to the point of payment, then the modal opens.

---

## SEO

- `components/ui/Seo.tsx` — title, description, canonical, Open Graph, Twitter, JSON-LD.
- `lib/seo.ts` — `TravelAgency`, `TouristTrip` (with itinerary + offer + rating), `FAQPage`.
- Per-page metadata is editable from the backend `seo` object; the code only supplies fallbacks.
- `/vehicles`, `/booking/*` and `/my-bookings` are `noindex` and disallowed in robots.txt.

## Performance

- ~118 kB shared JS; heaviest page 123 kB first load.
- ISR everywhere public, so pages serve from cache and refresh in the background.
- `next/image` with AVIF/WebP; hero images `priority`, everything else lazy.
- The Google Maps key stays server-side — autocomplete and distance go through
  `/api/maps`, and the route map is a keyless static embed.

## Accessibility

Labelled inputs throughout, `aria-expanded` on every disclosure, combobox roles
on autocomplete, visible focus rings, and `prefers-reduced-motion` respected in
`globals.css`.

## Layout

```
components/
  layout/    Header, Footer, Layout, LoginModal
  booking/   BookingWidget + Taxi/Dham/Hotel forms, PlaceInput
  home/      SectionRenderer + 7 section components
  results/   TripSummary, PriceTabs, VehicleCard, Itinerary, RouteMap
  packages/  PackageCard, ItinerarySteps, PlacesGrid, FaqList,
             InclusionLists, VehiclePicker, HotelPicker, PriceSummary
  ui/        Seo, Logo, SectionHeading, Stars, Skeleton, Container
context/     AuthContext, BookingContext, WebsiteContext (untouched)
lib/         api, payment, format, seo
src/themes/  untouched driver themes
```
