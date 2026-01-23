import React from 'react';
import Link from 'next/link';

interface CommonBannerOneProps {
  imgURL: string
  title: string
  breadcrumbOneTitle: string
  breadcrumbOneLink: string
  breadcrumbTwoTitle: string
}

const CommonBannerOne: React.FC<CommonBannerOneProps> = ({
    imgURL,
    title,
    breadcrumbOneTitle,
    breadcrumbOneLink,
    breadcrumbTwoTitle,
}) => {
    return (
        <section
    className="page-title d-flex align-items-center justify-content-center"
    style={{ backgroundImage: `url(${imgURL})`, minHeight: '300px' }}
>
    <div className="auto-container">
        <div className="title-outer text-center">
            <h1 className="title text-white">{title}</h1>
            <ul className="page-breadcrumb">
                <li>
                    <Link href={breadcrumbOneLink}>{breadcrumbOneTitle}</Link>
                </li>
                <li>{breadcrumbTwoTitle}</li>
            </ul>
        </div>
    </div>
</section>
    );
};

export default CommonBannerOne;
