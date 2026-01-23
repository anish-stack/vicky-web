import React from "react";
import Link from "next/link";

type FooterProps = {
  links: any
  socialLinks: any
  imgURL: string
  description: string
  phoneNoTitle: string
  phoneNo: string
  phoneNoLink: string
  aboutUsTitle: string
  aboutUsDescription: string
  linkTitle: string
  NewsletterTitle: string
  NewsletterSubTitle: string
  ButtonName: string
  CopyRight: string
};

const FooterOne: React.FC<FooterProps> = ({
  links,
  socialLinks,
  imgURL,
  description,
  phoneNoTitle,
  phoneNo,
  phoneNoLink,
  aboutUsTitle,
  aboutUsDescription,
  linkTitle,
  NewsletterTitle,
  NewsletterSubTitle,
  ButtonName,
  CopyRight
}) => {


  return (
    <footer className="main-footer footer-style-two">
      <div className="bg bg-pattern-4"></div>



      <div className="footer-top">

        <div className="auto-container">


          <div className="pt-5">
            <div className="footer-registration-button">
              <Link href="/driver-register">
                <h5>Driver Registration</h5>
              </Link>
            </div>
          </div>
          <div className="inner-container">
            <div className="top-left">
              {/* <div className="logo-box">
                <div className="logo">
                  <Link href="/">
                    <img src={imgURL} alt="Logo" width={120} />
                  </Link>
                </div>
              </div> */}

              <Link href="/" className="d-flex align-items-center">
                <span className="logo-text-highlight">Taxi</span><span className="logo-text">Safar</span>
              </Link>
            </div>
            <div className="top-center">
              <div className="text">
                {description}
              </div>
            </div>
            <div className="top-right">
              <div className="info-btn">
                <i className="icon fal fa-mobile"></i>
                <div className="content">
                  <h5 className="title">{phoneNoTitle}</h5>
                  <Link href={phoneNoLink} className="phone-no">{phoneNo}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="widgets-section">
        <div className="auto-container">
          <div className="row">
            <div className="footer-column col-lg-4 col-md-6 col-sm-12">
              <div className="footer-widget about-widget">
                <h5 className="widget-title">{aboutUsTitle}</h5>
                <div className="widget-content">
                  <div className="text">
                    {aboutUsDescription}
                  </div>

                </div>
              </div>
            </div>

            <div className="footer-column col-lg-3 col-md-6 col-sm-12">
              <div className="footer-widget links-widget">
                <h4 className="widget-title">{linkTitle}</h4>
                <div className="widget-content">
                  <ul
                    className="user-links"
                  // className="user-links two-column"
                  >
                    {links.map((data: any, index: any) => (
                      <li key={index}>
                        <i className="icon fa fa-angle-double-right"></i> <Link href={data?.link}>{data?.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-column col-lg-4 col-md-6 col-sm-12">
              <div className="footer-widget newsletter-widget">
                <h4 className="widget-title">{NewsletterTitle}</h4>
                <div className="widget-content">
                  <div className="text">{NewsletterSubTitle}</div>
                  <div className="newsletter-form">
                    <form method="post" action="#">
                      <div className="form-group">
                        <div className="input-outer">
                          <input
                            type="email"
                            name="email"
                            placeholder="Enter Your email."
                            required
                          />
                        </div>
                        <button
                          type="button"
                          className="theme-btn btn-style-one dark-line-two hover-light"
                        >
                          <span className="btn-title">{ButtonName}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="auto-container">
          <div className="inner-container">
            <div className="copyright-text">
              {CopyRight}
            </div>
            <ul className="footer-nav">
              {socialLinks.map((social: any, index: any) => (
                <li key={index}>
                  {/* <Link href="#"> */}
                  <i className={social.icon}></i> {social.name}
                  {/* </Link> */}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;
