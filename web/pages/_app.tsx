import type { AppProps } from "next/app";
import Router, { useRouter } from "next/router";
import HeaderWithoutMenu from "@/components/headers/headerWithoutMenu";

import { Col, Container, Row } from "react-bootstrap";

import { CustomerProvider } from "@/context/userContext";

import Link from "next/link";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useWebsite } from "@/context/WebsiteContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

const isDriverThemeRoute =
  router.pathname === "/[driverId]/[themeId]" || router.pathname === "/[slug]";
  return (
    <>
      <CustomerProvider>
        {!isDriverThemeRoute && <HeaderWithoutMenu />}

        <div style={{ minHeight: "100vh" }}>
          <Component {...pageProps} />
        </div>

        {!isDriverThemeRoute && (
          <div>
            <Container className="position-relative subscribe-section">
              <div className="subscribe-footer">
                <Row>
                  <Col md={6}>
                    <h4 className="title">
                      Stay Updated with <br /> the Latest News & Offers!
                    </h4>
                  </Col>
                  <Col md={6} className="d-flex align-items-center">
                    <div className="w-100">
                      <div className="email-container">
                        <input
                          type="email"
                          placeholder="Your email Id"
                          className="email-input"
                        />
                        <button className="subscribe-btn d-none d-lg-block">
                          Subscribe
                        </button>
                      </div>

                      <button className="taxisafar-theme-button d-block d-lg-none w-100 mt-3">
                        Subscribe
                      </button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Container>

            <div className="taxisafar-footer">
              <Container>
                <Row className="about-section">
                  <Col lg={4} md={6} xs={12} className="lg-mt-0 mt-4">
                    <div className="heading">
                      <img
                        className="logo"
                        src="/images/logo/taxisafar-logo.png"
                      />
                    </div>
                    <div className="description mt-4">
                      <p className="mb-0">
                        {
                          "Enjoy reliable, comfortable cab services tailored to your needs. From airport transfers to local rentals, round trips, and one-way rides—we’ve got you covered!"
                        }
                      </p>
                    </div>
                  </Col>

                  <Col lg={2} md={6} xs={6} className="lg-mt-0 mt-4">
                    <div className="heading">
                      <h6 className="title">Quick Link</h6>
                    </div>
                    <div className="links mt-4 ms-1">
                      <div>
                        <Link className="mb-0" href="/">
                          Home
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/about">
                          About
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/services">
                          Service
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/contact">
                          Contact
                        </Link>
                      </div>
                    </div>
                  </Col>

                  <Col lg={2} md={6} xs={6} className="lg-mt-0 mt-4">
                    <div className="heading">
                      <h6 className="title">Support</h6>
                    </div>
                    <div className="links mt-4">
                      <div>
                        <Link className="mb-0" href="/customer-support">
                          Customer Support
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/faq">
                          FAQs
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/privacy-policy">
                          Privacy Policy
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/terms-of-use">
                          Terms Of Use
                        </Link>
                      </div>
                      {/* <div className="mt-2">
                      <Link className="mb-0" href="/terms-and-conditions">
                        Terms & Conditions
                      </Link>
                    </div> */}
                      <div className="mt-2">
                        <Link
                          className="mb-0"
                          href="/refund-and-cancellation-policy"
                        >
                          Refund and Cancellation Policy
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link className="mb-0" href="/driver-onboarding-sop">
                          Driver Onboarding SOP
                        </Link>
                      </div>

                      {/* <div className="mt-2">
                      <Link className="mb-0" href="/compliance-manual">
                        Compliance Manual
                      </Link>
                    </div> */}
                    </div>
                  </Col>

                  <Col lg={4} md={6} xs={12} className="lg-mt-0 mt-4">
                    <div className="heading">
                      <h6 className="title">Contact</h6>
                    </div>
                    <div className="contact mt-4">
                      <Row>
                        <Col xs={2}>
                          <div className="icon">
                            <i
                              className="fa-light fa-comment"
                              style={{ fontSize: "26px", color: "#e52710" }}
                            ></i>
                          </div>
                        </Col>

                        <Col xs={10} className="ps-3">
                          <p className="title mb-0">Customer support Anytime</p>
                          {/* <Link href="tel:+919412222722">+91 94122 22722</Link> */}
                          <Link
                            href="https://whatsform.com/cs2ujv"
                            target="_blank"
                          >
                            Customer Support Chat
                          </Link>
                        </Col>
                      </Row>

                      <Row className="mt-4">
                        <Col xs={2}>
                          <div className="icon">
                            <img
                              src="/images/icons/mail.png"
                              width="28"
                              height="28"
                            />
                          </div>
                        </Col>

                        <Col xs={10} className="ps-3">
                          <p className="title mb-0">Email</p>
                          <Link href="mailto:support@taxisafar.com">
                            support@taxisafar.com
                          </Link>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>

                <div className="copy-right-border"></div>

                {/* <div className="copy-right-section d-block d-lg-flex justify-content-between align-items-center">
                <p className="text mb-0">
                  Copyright © TaxiSafar. All rights reserved @2025.
                </p>
                <p className="text mb-0">VCS</p>
                <div className="social-media">
                  <Link href="https://www.facebook.com/share/1BivyMpcWq/" target="_blank"><i className="fa-brands fa-facebook-f"></i></Link>
                  <Link href="https://www.instagram.com/vcsvlogs/" target="_blank"><i className="fa-brands fa-instagram"></i></Link>
                  <Link href="#"><i className="fa-brands fa-linkedin-in"></i></Link>
                  <Link href=" https://youtube.com/@vickykvlog4410?si=1acEHIXVR0wsGc4x" target="_blank"><i className="fa-brands fa-youtube"></i></Link>
                </div>
              </div> */}

                <div className="copy-right-section d-block d-lg-flex justify-content-between align-items-center">
                  <p className="text mb-0 order-lg-1">
                    Copyright © TaxiSafar. All rights reserved @2025.
                  </p>
                  <p className="company-text mb-0 order-lg-2 mx-auto text-bold">
                    VCS Fleet Private Limited
                  </p>
                  <div className="social-media order-lg-3">
                    <Link
                      href="https://www.facebook.com/share/1BivyMpcWq/"
                      target="_blank"
                    >
                      <i className="fa-brands fa-facebook-f"></i>
                    </Link>
                    <Link
                      href="https://www.instagram.com/vcsvlogs/"
                      target="_blank"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </Link>
                    {/* <Link href="#"> */}
                    <i className="fa-brands fa-linkedin-in"></i>
                    {/* </Link> */}
                    <Link
                      href="https://youtube.com/@vickykvlog4410?si=1acEHIXVR0wsGc4x"
                      target="_blank"
                    >
                      <i className="fa-brands fa-youtube"></i>
                    </Link>
                  </div>
                </div>
              </Container>
            </div>
          </div>
        )}
      </CustomerProvider>
    </>
  );
}
