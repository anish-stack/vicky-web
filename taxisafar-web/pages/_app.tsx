import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <BookingProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#EF3124" />
        </Head>
        <Component {...pageProps} />
      </BookingProvider>
    </AuthProvider>
  );
}
