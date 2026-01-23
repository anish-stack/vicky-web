import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type HeaderProps = {
    menu: any;
    mobileMenu: any
    logoSrc: string
    buttonName: string
    buttonLink: string
    emailTitle: string
    emailId: string
    emailLink: string
    phoneNoTitle: string
    phoneNo: string
    phoneNoLink: string
    addressTitle: string
    address: string
    socialLinks: any
};

const HeaderOne: React.FC<HeaderProps> = ({
    menu,
    mobileMenu,
    logoSrc,
    buttonName,
    buttonLink,
    emailTitle,
    emailId,
    emailLink,
    phoneNoTitle,
    phoneNo,
    phoneNoLink,
    addressTitle,
    address,
    socialLinks
}) => {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setOpenMobileMenu(false)
      }, [router]);

    return (
        <header
            className={`main-header header-style-one ${openMobileMenu ? 'mobile-menu-visible' : ''}`}
        >
            <div className="header-top">
                <div className="auto-container">
                    <div className="inner-container">
                        <div className="top-left">
                            <ul className="list-style-one">
                                <li>
                                    <i className="fal fa-mobile"></i>
                                    <Link href={phoneNoLink}>{phoneNo}</Link>
                                </li>
                                <li>
                                    <i className="fal fa-envelope"></i>
                                    <Link href={emailLink}>
                                        <span
                                            className="__cf_email__"
                                            data-cfemail="d0b9beb6bf90b4a5bda9fda4b1a8b9feb3bfbd"
                                        >
                                            {emailId}
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="top-right">
                            {/* <ul className="social-icon-one">
                                <li>
                                    <Link href="#">
                                        <i className="fab fa-facebook"></i>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#">
                                        <i className="fab fa-twitter"></i>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#">
                                        <i className="fab fa-linkedin"></i>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#">
                                        <i className="fab fa-instagram"></i>
                                    </Link>
                                </li>
                            </ul> */}
                            <ul className="social-icon-one">
                                {socialLinks.map((link: any, index: any) => (
                                    <li key={index}>
                                        <Link href={link.href}>
                                            <i className={link.iconClass}></i>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="header-lower">
                <div className="auto-container">
                    <div className="main-box">
                        <div className="logo-box">
                            <div className="logo">
                                <Link href="/">
                                    <img src={logoSrc} alt="Logo" width={80} />
                                </Link>
                            </div>
                        </div>

                        <div className="nav-outer">
                            <nav className="nav main-menu">
                                <ul className="navigation">
                                    {menu.map((item: any, index: any) => (
                                        <li key={index} 
                                        // className={item.className || ""}
                                        className={`${router.pathname == item.href ? "current" : ""}`}
                                        >
                                            <Link href={item.href}>{item.title}</Link>
                                            {item.submenu && (
                                                <ul>
                                                    {item.submenu.map((subItem: any, subIndex: any) => (
                                                        <li key={subIndex} className={subItem.className || ""}>
                                                            <Link href={subItem.href}>{subItem.title}</Link>
                                                            {subItem.submenu && (
                                                                <ul>
                                                                    {subItem.submenu.map(
                                                                        (nestedSubItem: any, nestedIndex: any) => (
                                                                            <li key={nestedIndex}>
                                                                                <Link href={nestedSubItem.href}>
                                                                                    {nestedSubItem.title}
                                                                                </Link>
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>

                        <div className="outer-box">

                            <div className="btn-box">
                                <Link
                                    href={buttonLink}
                                    className="theme-btn btn-style-one dark-line-two hover-light"
                                >
                                    <span className="btn-title">{buttonName}</span>
                                </Link>
                            </div>

                            <div className="mobile-nav-toggler light" onClick={() => setOpenMobileMenu(true)}>
                                <span className="icon fa-regular fa-bars"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mobile-menu">
                <div className="menu-backdrop"></div>

                <nav className="menu-box">
                    <div className="upper-box">
                        <div className="nav-logo">
                            <Link href="/">
                                <img src={logoSrc} alt="" title="" />
                            </Link>
                        </div>
                        <div className="close-btn" onClick={() => setOpenMobileMenu(false)}>
                            <i className="icon fa fa-times"></i>
                        </div>
                    </div>

                    <ul className="navigation clearfix">
                        {mobileMenu.map((item: any, index: any) => (
                            <li key={index} 
                            // className={item.className || ""}
                            className={`${router.pathname == item.href ? "current" : ""}`}
                            >
                                <Link href={item.href}>{item.title}</Link>
                                {item.submenu && (
                                    <ul>
                                        {item.submenu.map((subItem: any, subIndex: any) => (
                                            <li key={subIndex} className={subItem.className || ""}>
                                                <Link href={subItem.href}>{subItem.title}</Link>
                                                {subItem.submenu && (
                                                    <ul>
                                                        {subItem.submenu.map(
                                                            (nestedSubItem: any, nestedIndex: any) => (
                                                                <li key={nestedIndex}>
                                                                    <Link href={nestedSubItem.href}>
                                                                        {nestedSubItem.title}
                                                                    </Link>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                )}
                                                {subItem.submenu && (
                                                    <div className="dropdown-btn">
                                                        <i className="fa fa-angle-down"></i>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {item.submenu && (
                                    <div className="dropdown-btn">
                                        <i className="fa fa-angle-down"></i>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    <ul className="contact-list-one light">
                        <li>
                            <i className="fa-light fa-phone icon"></i>
                            <span className="title">{phoneNoTitle}</span>
                            <div className="text">
                                <Link href={phoneNoLink}>{phoneNo}</Link>
                            </div>
                        </li>
                        <li>
                            <i className="fa-light fa-envelope icon"></i>
                            <span className="title">{emailTitle}</span>
                            <div className="text">
                                <Link href={emailLink}>{emailId}</Link>
                            </div>
                        </li>
                        <li>
                            <i className="fa-light fa-location-dot icon"></i>
                            <span className="title">{addressTitle}</span>
                            <div className="text">{address}</div>
                        </li>
                    </ul>

                    <ul className="social-links">
                        {socialLinks.map((link: any, index: any) => (
                            <li key={index}>
                                <Link href={link.href}>
                                    <i className={link.iconClass}></i>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>


            {/* <div className="sticky-header">
          <div className="auto-container">
            <div className="inner-container">
              <div className="logo">
                <Link href="/" title="">
                  <img src="images/logo.png" alt="" title="" />
                </Link>
              </div>

              <div className="nav-outer">
                <nav className="main-menu">
                  <div className="navbar-collapse show collapse clearfix">
                    <ul className="navigation clearfix">
                    </ul>
                  </div>
                </nav>

                <div className="mobile-nav-toggler">
                  <span className="icon lnr-icon-bars"></span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        </header>
    );
};

export default HeaderOne;
