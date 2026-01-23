import React from 'react';
import Link from 'next/link';

interface TestimonialCardOneProps {
    text: string;
    image: string;
    author: string;
    designation: string;
    rating: any
}

const TestimonialCardOne: React.FC<TestimonialCardOneProps> = ({
    text,
    image,
    author,
    designation,
    rating
}) => {
    return (
        <div className="inner-box">
            <div className="content">
                <div className="text">{text}</div>
                <div className="box-info">
                    <div className="author-box">
                        <figure className="author-image">
                            <img src={image} alt="" />
                        </figure>
                        <div className="author-info">
                            <h4 className="name">{author}</h4>
                            <span className="designation">{designation}</span>
                        </div>
                    </div>
                    <div className="author-rating">
                        <div className="rating-title">Quality Services</div>
                        <div className="rating">
                            {[...Array(rating)]?.map((_, i) => (
                                <i className="fa fa-star" key={i}></i>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCardOne;
