import React, { useState } from 'react';
import parse from 'html-react-parser';

interface FaqSectionOneProps {
    title: string;
    subtitle: string;
    imageURL: string;
    faqData: any
}

const FaqSectionOne: React.FC<FaqSectionOneProps> = ({
    title,
    subtitle,
    imageURL,
    faqData
}) => {
    const [activeId, setActiveId] = useState(1);

    const handleToggle = (id: any) => {
        setActiveId(activeId === id ? null : id);
    };
    return (
        <section className="faqs-section">
            <div className="auto-container">
                <div className="row">
                    <div className="faq-column col-xl-5 col-lg-12">
                        <div className="inner-column">
                            <div className="sec-title">
                                <span className="sub-title">{parse(title)}</span>
                                <h2 className="letters-slide-up text-split">{parse(subtitle)}</h2>
                            </div>
                            <ul className="accordion-box style-two wow fadeInLeft">
                                {faqData.map((obj: any, index: any) => (
                                    <li
                                        key={obj.id}
                                        className={`accordion block ${activeId === obj.id ? "active-block" : ""}`}
                                    >
                                        <div
                                            className={`acc-btn ${activeId === obj.id ? "active" : ""}`}
                                            onClick={() => handleToggle(obj.id)}
                                        >
                                            {index + 1}. {obj.question}
                                            <div className="icon fa fa-chevron-right"></div>
                                        </div>
                                        <div className={`acc-content ${activeId === obj.id ? "current" : ""}`}>
                                            <div className="content">
                                                <div className="text">{obj.answer}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="image-column col-xl-7">
                        <div className="inner-column wow fadeInRight">
                            <figure className="image reveall">
                                <img src={imageURL} alt="Image" />
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqSectionOne;
