# TaxiSafar API — Audit & Fixes

## Critical
- **Booking bound to wrong user (513 → 512):** `POST /api/trip` and
  `POST /api/transaction` were unauthenticated and read `user_id` from the
  request body. A stale client-side id could override the real one. Both routes
  now require a valid JWT, and for `role: "customer"` tokens the `user_id` is
  taken from the verified token — never from the body. Staff/admin tokens may
  still book on behalf of a customer with an explicit `user_id`.
- Because the booking is now linked to the correct user, admin/customer
  WhatsApp notifications (built from the joined user record) always carry the
  correct name and phone number.

## Security
- `JWT_SECRET` is now required in production (boot fails if missing); removed the
  hardcoded `"mysecretkey"` fallback. `.env` ships a strong generated secret.
- Removed committed `firebaseServiceAccount.json` (credentials) and the unused
  `firebase-admin` initialization/dependency.
- Cleaned `.env`: dropped dead `BUZZX_*`, `FAST2SMS_API_KEY`, and the duplicate
  `MYOPERATOR_*` block. Added `.env.example`.

## Session persistence
- Login token lifetime unified to 7 days so returning users stay signed in.

## Cleanup
- Removed debug `console.log` statements, dead commented blocks, `.DS_Store`
  and editor swap files.

## Business logic
- Unchanged. Only user-id binding, auth, secrets, and noise were touched.

## Update 2
- Disabled Sequelize SQL query logging (`logging: false`) — no more
  `Executing (default): SELECT ...` spam in the console.
- Razorpay credentials now auto-switch by `NODE_ENV`: production uses the LIVE
  keys, everything else uses TEST. Both pairs live in `.env`
  (`RAZORPAY_TEST_*` / `RAZORPAY_LIVE_*`).
- The name a customer enters while booking is now persisted to the `users`
  table on transaction create (in addition to the existing create-customer step).
