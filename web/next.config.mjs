/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	typescript: {
		// Don't fail production build because of TypeScript errors
		ignoreBuildErrors: true,
	},

	// Only client-safe values are exposed to the browser
	env: {
		API_URL: process.env.API_URL,
		GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,

		NEXT_PUBLIC_RAZORPAY_KEY_ID:
			process.env.RAZORPAY_LIVE_KEY_ID,
	},
};

export default nextConfig;