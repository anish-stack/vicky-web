import React, { useState } from 'react';
import parse from 'html-react-parser';

interface IconInfoOneProps {
    title: string
    subTitle: string
    workBlocks: any

}

const IconInfoOne: React.FC<IconInfoOneProps> = ({
    title,
    subTitle,
    workBlocks
}) => {

    return (
        <>
            <section className="work-section">
                <div className="auto-container">
                    <div className="sec-title text-center">
                        <span className="sub-title">{title}</span>
                        <h2 className="letters-slide-up text-split">{subTitle}</h2>
                    </div>
                    <div className="row">
                        {workBlocks.map((block: any, index: any) => (
                            <div key={index} className="work-block col-lg-4 col-md-6">
                                <div className="inner-box">
                                    <i className={`icon ${block.icon}`}></i>
                                    <div className="content">
                                        <h4 className="title">{block.title}</h4>
                                        <div className="text">{block.text}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default IconInfoOne;
