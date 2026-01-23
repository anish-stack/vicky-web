import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";
import { useCustomerContext } from "@/context/userContext";

type HeaderWithoutMenuProps = {

};

const HeaderWithoutMenu: React.FC<HeaderWithoutMenuProps> = ({

}) => {
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef(null) as any;

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const handleOutsideClick = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setShowPopup(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    // const isAuthenticated = false;

    // const Router = useRouter();

    const { isAuthenticated, checkAuth } = useAuth();

    const [authenticate, setAuthenticate] = useState(false);
    const Router = useRouter();

    const { pathname } = Router;

    const signOut = () => {
        localStorage.removeItem('token');
        setOpenSideBar(false)
        setShowPopup(false);
        if (pathname == '/booking') {
            Router.push('/login');
        } else if (pathname == '/driver-dashboard' || pathname == '/driver-kyc' || pathname == '/driver-transactions' || pathname == '/driver-vehicles' || pathname == '/driver-profile') {
            Router.push('/driver-login');
        }
        checkAuth();
    }

    useEffect(() => {
        checkAuth();
        setAuthenticate(isAuthenticated);
    }, [isAuthenticated, Router]);

    const { customerDetail } = useCustomerContext();

    const [openSideBar, setOpenSideBar] = useState(false);

    useEffect(() => {
        setOpenSideBar(false);
    }, [Router]);

    const [openMenuSideBar, setOpenMenuSideBar] = useState(false);

    useEffect(() => {
        setOpenMenuSideBar(false);
    }, [Router]);

    return (
        <>
            <aside className={`off-canvas-wrapper ${openSideBar ? 'open' : ''}`}>
                <div className="off-canvas-overlay"></div>
                <div className="off-canvas-inner-content">
                    <div className="btn-close-off-canvas" onClick={() => setOpenSideBar(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </div>


                    <div className="off-canvas-inner">
                        <Link href="/" className="d-flex align-items-center justify-content-center text-logo">
                            <img src="/images/logo/taxisafar-logo.png" width="181px" height="30px" />
                            {/* <img src="/images/logo/taxisafar-logo.png" width="200px" /> */}
                            {/* <span className="logo-text-highlight">Taxi</span><span className="logo-text">Safar</span> */}
                        </Link>

                        {customerDetail?.role == 'driver' && (
                            <div className="sidebar-menu">
                                <div className={`sidebar-menu-item ${pathname == '/driver-profile' ? 'active' : ''} mt-1`}>
                                    <Link href="/driver-profile" className="mb-0">My Profile</Link>
                                </div>

                                <div className={`sidebar-menu-item ${pathname == '/driver-kyc' ? 'active' : ''} mt-1`}>
                                    <Link href="/driver-kyc" className="mb-0">KYC</Link>
                                </div>

                                <div className={`sidebar-menu-item ${pathname == '/driver-vehicles' ? 'active' : ''} mt-1`}>
                                    <Link href="/driver-vehicles" className="mb-0">Vehicles</Link>
                                </div>

                                <div className={`sidebar-menu-item ${pathname == '/driver-transactions' ? 'active' : ''} mt-1`}>
                                    <Link href="/driver-transactions" className="mb-0">Transactions</Link>
                                </div>
                            </div>
                        )}


                        {customerDetail?.role == 'customer' && (
                            <div>

                                <div className="user-menu-info mt-4 d-flex align-items-center">
                                    <div className="taxisafar-menu-profilepic me-3">
                                        <img src="/images/icons/taxisafar-user-icon.png" width="50px" height="50px" />
                                    </div>

                                    <div className="taxisafar-user-info">
                                        <p className="taxisafar-username mb-0">{customerDetail?.name}</p>
                                        <Link href="/edit-profile" className="taxisafar-edit">Edit Account</Link>
                                    </div>
                                </div>

                                <div className="sidebar-links">
                                    <Link href="/" className="d-flex align-items-center mt-4">
                                        <img className="me-3" src="/images/icons/home-menu-icon.png" width={24} />
                                        <p className="mb-0">Home</p>
                                    </Link>

                                    <Link href="/booking" className="d-flex align-items-center mt-4">
                                        <img className="me-3" src="/images/icons/mytrip-menu-icon.png" width={24} />
                                        <p className="mb-0">My Trip</p>
                                    </Link>

                                    <Link href="#" className="d-flex align-items-center mt-4">
                                        <img className="me-3" src="/images/icons/notifications-menu-icon.png" width={24} />
                                        <p className="mb-0">Notification</p>
                                    </Link>
                                </div>
                            </div>

                        )}


                        <div className="sidebar-bottom-menu">
                            {/* <div className="logout mt-1" onClick={signOut}>
                                <p className="mb-0">Sign Out</p>
                            </div> */}

                            <div className="taxisafar-sidebar-logout d-flex align-items-center justify-content-center" onClick={signOut}>
                                <img src="/images/icons/taxisafar-logout.png" height="24" width="24" className="me-2" />
                                <p className="mb-0">Logout</p>
                            </div>
                        </div>

                    </div>
                </div>
            </aside>

            <aside className={`off-canvas-wrapper ${openMenuSideBar ? 'open' : ''}`}>
                <div className="off-canvas-overlay"></div>
                <div className="off-canvas-inner-content">
                    <div className="btn-close-off-canvas" onClick={() => setOpenMenuSideBar(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </div>

                    <div className="off-canvas-inner">
                        <Link href="/" className="d-flex align-items-center justify-content-center text-logo">
                            <img src="/images/logo/taxisafar-logo.png" width="181px" height="30px" />
                        </Link>



                        <div className="sidebar-links mb-4">
                            <Link href="/" className="d-flex align-items-center mt-4">
                                <img className="me-3" src="/images/icons/home-menu-icon.png" width={24} />
                                <p className="mb-0">Home</p>
                            </Link>

                            {isAuthenticated && (
                                <>
                                    <Link href="/booking" className="d-flex align-items-center mt-4">
                                        <img className="me-3" src="/images/icons/mytrip-menu-icon.png" width={24} />
                                        <p className="mb-0">My Trip</p>
                                    </Link>

                                    <Link href="#" className="d-flex align-items-center mt-4">
                                        <img className="me-3" src="/images/icons/notifications-menu-icon.png" width={24} />
                                        <p className="mb-0">Notification</p>
                                    </Link>
                                </>
                            )}

                        </div>
                        {/* <Link href={"#"}>
                            <div className="taxisafar-theme-outline-button w-100 mt-4 text-center">Register</div>
                        </Link> */}

                        <Link href={"/login"}>
                            <div className="taxisafar-theme-button w-100 mt-2 text-center">Log In</div>
                        </Link>

                    </div>

                </div>
            </aside>
            <header className="vicky-cabbazar-header d-flex">
                <div className="container d-flex align-items-center justify-content-between">
                    <Link href="/" className="d-flex align-items-center">
                        <img src="/images/logo/taxisafar-logo.png" className="taxisafar-logo" width="212.42px" height="35px" />
                    </Link>
                    {isAuthenticated ? <div style={{ position: "relative" }}>
                        <div className="user-img"
                            onClick={() => setOpenSideBar(true)}
                        >
                            <div className="d-flex justify-content-center align-items-center taxisafar-user-icon">
                                <img src="/images/icons/user-profile-icon.png" height="20" width="20" />
                            </div>


                            {/* <img src="/images/icons/user.jpg" width={40} /> */}
                            {/* <img src="/images/logo/taxisafar-logo.png" width="181px" height="30px" /> */}
                        </div>



                        {showPopup && (
                            <div
                                className="vicky-popup mt-2"
                                ref={popupRef}
                            >
                                <div className="user-img d-inline-flex align-items-center">
                                    <Link href="/booking">
                                        <img src="/images/icons/user.jpg" width={50} className="me-2" />
                                    </Link>
                                    {customerDetail?.name && (<p className="mb-0 fw-bold">{customerDetail?.name}</p>)}
                                </div>
                                <div className="vickycab-sign-out mt-1 custom-cursor-pointer" onClick={signOut}>
                                    <p className="mb-0 fs-6 text-center">Sign Out</p>
                                </div>
                            </div>
                        )}
                    </div> :
                        <div className="d-inline-flex gap-2">
                            {/* <Link href={"#"}>
                                <div className="taxisafar-theme-outline-button">Register</div>
                            </Link> */}
                            <Link href={"/login"}>
                                <div className="taxisafar-theme-button">Log In</div>
                            </Link>

                            <div className="d-flex justify-content-center align-items-center taxisafar-user-icon d-lg-none d-block" onClick={() => setOpenMenuSideBar(true)}>
                                <img src="/images/icons/user-profile-icon.png" height="20" width="20" />
                            </div>
                        </div>

                    }
                </div>
            </header>
        </>

    );
};

export default HeaderWithoutMenu;
