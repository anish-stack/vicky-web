import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/themes/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", lg: "1.5rem" },
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        brand: {
          50: "#FFF1F0",
          100: "#FFE0DD",
          200: "#FFC2BC",
          300: "#FF9389",
          400: "#FA5F52",
          500: "#EF3124",
          600: "#DC2418",
          700: "#B81C12",
          800: "#951A13",
          900: "#7A1A15",
        },
        ink: {
          DEFAULT: "#111111",
          soft: "#3D3D3D",
          muted: "#6E6E6E",
          faint: "#9A9A9A",
        },
        line: "#E9E9E9",
        surface: "#F5F5F5",
      },
      fontFamily: {
        display: ["var(--font-display)", "Poppins", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.125rem", "3xl": "1.5rem" },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,17,0.04), 0 8px 24px rgba(17,17,17,0.06)",
        widget: "0 12px 40px rgba(17,17,17,0.14)",
        pop: "0 4px 16px rgba(17,17,17,0.10)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { "fade-up": "fade-up .4s ease-out both", shimmer: "shimmer 1.4s infinite" },
    },
  },
  plugins: [],
};
export default config;
