import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Classic Font Awesome 6 — covers fa-solid, fa-regular, fa-brands
            (matches the fa-solid/fa-brands classes used across the app).
            Previously this loaded FA4.7 (old "fa fa-x" syntax, no fa-solid/
            fa-brands support) PLUS FA6 "Sharp" style sheets (fa-sharp-*
            naming, different from fa-solid/fa-brands) — neither matched the
            classes actually used in components, so icons rendered as a
            missing-glyph box. */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossOrigin="anonymous" />

        {/* Sharp style — ONLY needed if some component actually uses
            fa-sharp fa-solid / fa-sharp fa-regular etc. classes. Keep these
            only if you're intentionally using Sharp-style icons somewhere;
            otherwise they're dead weight since nothing in the codebase uses
            the fa-sharp-* prefix today. */}
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v6.5.2/css/sharp-thin.css"
        />

        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v6.5.2/css/sharp-solid.css"
        />

        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v6.5.2/css/sharp-regular.css"
        />

        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v6.5.2/css/sharp-light.css"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
          rel="stylesheet"
        /> */}

        {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
        {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> */}
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wdth,wght@75..100,100..900&display=swap" rel="stylesheet" />

        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@hugeicons/css/font.min.css" /> */}
        {/* <link rel="stylesheet" href="https://cdn.hugeicons.com/font/hgi-stroke-rounded.css" /> */}

        <link rel="stylesheet" href="https://cdn.hugeicons.com/font/hgi-stroke-rounded.css" />

        {/* <script src="https://checkout.razorpay.com/v1/checkout.js"></script> */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          onLoad={() => console.log("Razorpay script loaded successfully!")}
        />

        {/* <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        /> */}


      </Head>
      <body className="body-bg">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}