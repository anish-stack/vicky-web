/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	env: {
		API_URL: "https://www.webapi.taxisafar.com",
		// API_URL: "https://www.webapi.taxisafar.com",

		// RAZORPAY_KEY_ID: "rzp_test_wPADsslOGY4zIb",
		// RAZORPAY_KEY_SECRET: "7XteXj17HF1GQhnxA8duPvCX",
		// NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_test_wPADsslOGY4zIb",

		// below is taxisafar new Test RAZORPAY account
		RAZORPAY_KEY_ID: "rzp_test_fpge3udxlBXTMw",
		RAZORPAY_KEY_SECRET: "MgX5Hiq1C7JqZcxSgkaFU3bJ",
		NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_test_fpge3udxlBXTMw",

		// below is taxisafar new Live RAZORPAY account
		// RAZORPAY_KEY_ID: "rzp_live_3GX1MwM4UFc4QG",
		// RAZORPAY_KEY_SECRET: "2dRT7VNgUpVqjTBya3cUq0Kt",
		// NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_live_3GX1MwM4UFc4QG",

		// google map API Key
		GOOGLE_MAP_API_KEY: "AIzaSyDnyLLiPykuaRbCKZEmBPa0jzdiB61qRpc",
	},
};

export default nextConfig;
