/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	// Only client-safe values are inlined here, sourced from the environment.
	// Server-only secrets (e.g. RAZORPAY_KEY_SECRET) are read directly from
	// process.env inside API routes and are never exposed to the browser.
	env: {
		API_URL: process.env.API_URL,
		GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
		// Public Razorpay key id auto-switches with the environment.
		NEXT_PUBLIC_RAZORPAY_KEY_ID:process.env.RAZORPAY_LIVE_KEY_ID
		
	},
};

export default nextConfig;
