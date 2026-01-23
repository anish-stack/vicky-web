import React from 'react';
import Link from 'next/link';

interface ContactFormOneProps {
    formTitle: string
    formSubTitle: string
    formButton: string
    contactTitle: string
    contactSubTitle: string
    contactDescription: string
    phoneNoTitle: string
    phoneNo: string
    phoneNoLink: string
    mailTitle: string
    mail: string
    mailLink: string
    addressTitle: string
    address: string
}

const ContactFormOne: React.FC<ContactFormOneProps> = ({
    formTitle,
    formSubTitle,
    formButton,
    contactTitle,
    contactSubTitle,
    contactDescription,
    phoneNoTitle,
    phoneNo,
    phoneNoLink,
    mailTitle,
    mail,
    mailLink,
    addressTitle,
    address,
}) => {
    return (
        <section className="contact-details my-5">
            <div className="container">
                <div className="row">
                    <div className="col-xl-7 col-lg-6">
                        <div className="sec-title">
                            <span className="sub-title">{formTitle}</span>
                            <h2>{formSubTitle}</h2>
                        </div>
                        <form
                            id="contact_form"
                            name="contact_form"
                        >
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="mb-3">
                                        <input
                                            name="form_name"
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter Name"
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="mb-3">
                                        <input
                                            name="form_email"
                                            className="form-control required email"
                                            type="email"
                                            placeholder="Enter Email"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="mb-3">
                                        <input
                                            name="form_subject"
                                            className="form-control required"
                                            type="text"
                                            placeholder="Enter Subject"
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="mb-3">
                                        <input
                                            name="form_phone"
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter Phone"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <textarea
                                    name="form_message"
                                    className="form-control required"
                                    rows={7}
                                    placeholder="Enter Message"
                                ></textarea>
                            </div>
                            <div className="mb-5">
                                <input
                                    name="form_botcheck"
                                    className="form-control"
                                    type="hidden"
                                    value=""
                                />
                                <button
                                    type="submit"
                                    className="taxisafar-theme-button"
                                    data-loading-text="Please wait..."
                                >
                                    <span className="btn-title">{formButton}</span>
                                </button>

                            </div>
                        </form>
                    </div>
                    <div className="col-xl-5 col-lg-6">
                        <div className="contact-details__right">
                            <div className="sec-title">
                                <span className="sub-title">{contactTitle}</span>
                                <h2>{contactSubTitle}</h2>
                                <div className="text">
                                    {contactDescription}
                                </div>
                            </div>
                            <ul className="list-unstyled contact-details__info">
                                <li className="d-block d-sm-flex align-items-sm-center">
                                    <div className="icon">
                                        <span className="fa-light fa-phone-rotary"></span>
                                    </div>
                                    <div className="text ml-xs--0 mt-xs-10">
                                        <h4 className='text-dark'>{phoneNoTitle}</h4>
                                        <Link href={phoneNoLink}>
                                            {phoneNo}
                                        </Link>
                                    </div>
                                </li>
                                <li className="d-block d-sm-flex align-items-sm-center">
                                    <div className="icon">
                                        <span className="fa-light fa-envelopes-bulk"></span>
                                    </div>
                                    <div className="text ml-xs--0 mt-xs-10">
                                        <h4 className='text-dark'>{mailTitle}</h4>
                                        <Link href={mailLink}>
                                            {mail}
                                        </Link>
                                    </div>
                                </li>
                                <li className="d-block d-sm-flex align-items-sm-center">
                                    <div className="icon">
                                        <span className="fa-light fa-location-dot"></span>
                                    </div>
                                    <div className="text ml-xs--0 mt-xs-10">
                                        <h4 className='text-dark'>{addressTitle}</h4>
                                        <span>{address}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactFormOne;
