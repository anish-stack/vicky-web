import React, { useEffect } from 'react';
import parse from 'html-react-parser';

interface ContactMapOneProps {
    iframe: string
}

const ContactMapOne: React.FC<ContactMapOneProps> = ({
    iframe
}) => {
    useEffect(() => {
        Array.from(document.querySelectorAll("#contact-map iframe"))
            .map((obj: any) => {
                obj.style.height = "500px";
                obj.style.width = "100%";
                obj.style.position = "absolute";
                obj.style.top = 0;
                obj.style.left = 0;
                obj.style.border = 0;
            })
    });
    return (
        <div className="contact-map">
            <div className="" style={{ height: "500px" }} id="contact-map">
                {parse(iframe)}
            </div>
        </div>
    );
};

export default ContactMapOne;
