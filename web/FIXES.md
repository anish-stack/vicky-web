# TaxiSafar Web — Audit & Fixes

## Security
- Removed hardcoded Razorpay (test + live) and Google Maps keys from
  `next.config.mjs`. Client-safe values are now inlined from the environment;
  `RAZORPAY_KEY_SECRET` is no longer exposed to the browser bundle and is read
  only by server API routes from `.env`.
- Added `.env` / `.env.example` with the correct variable set.

## Session persistence (no re-asking name / mobile / OTP)
- The booking dialog (`PricingCardThree`) now detects an existing authenticated
  session and pre-fills name + mobile and skips the OTP step, so logged-in users
  can book again without re-registering or re-verifying.

## Cleanup
- Removed the unused `firebase` dependency and `lib/firebase.js`.
- Removed the duplicate/dead `src/themes/driver-premiums` theme and the unused
  `driver-premium/ThemeFour.tsx` stub (not referenced by `ThemeRenderer`).
- Removed debug `console.log` statements, `.DS_Store`, editor swap files, the
  starter `pages/api/hello.ts`, and a stray non-asset PDF.

## Business logic / UI
- Unchanged except the session-aware booking shortcut above.

## Update 2
- Razorpay public + server keys auto-switch by environment (production -> LIVE,
  dev -> TEST) via `RAZORPAY_TEST_*` / `RAZORPAY_LIVE_*` in `.env`.
- After a successful booking, the saved session (`sessionStorage.sessionId`) is
  cleared, so the home banner no longer restores the old pickup/drop.
