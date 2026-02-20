"use client";

import {
  useState,
  FormEvent,
  ChangeEvent,
} from "react";
import { X } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type FormDataType = {
  name: string;
  phone: string;
  email: string;
  tripType: string;
  message: string;
};

const ContactPopup = ({
  isOpen,
  onClose,
}: Props) => {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const companyName =
    basicInfo.name || "Taxi Safar";
  const whatsapp =
    basicInfo.whatsapp ||
    basicInfo.phone ||
    "9876543210";

  const [formData, setFormData] =
    useState<FormDataType>({
      name: "",
      phone: "",
      email: "",
      tripType: "one-way",
      message: "",
    });

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

 const text = `
*New Enquiry*
${basicInfo?.logo_name}

Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Trip: ${formData.tripType}

Message:
${formData.message}
`.trim();

    window.open(
      `https://wa.me/91${whatsapp}?text=${encodeURIComponent(
        text,
      )}`,
      "_blank",
    );

    onClose();

    setFormData({
      name: "",
      phone: "",
      email: "",
      tripType: "one-way",
      message: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative p-6">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3"
        >
          <X />
        </button>

        <h3 className="text-xl font-bold mb-4">
          Contact Us
        </h3>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            required
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="input"
          />

          <input
            required
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="input"
          />

          <input
            required
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="input"
          />

          {/* TRIP TYPE */}
          <select
            name="tripType"
            value={formData.tripType}
            onChange={handleChange}
            className="input"
          >
            <option value="one-way">
              One Way
            </option>
            <option value="round-trip">
              Round Trip
            </option>
            <option value="outstation">
              Outstation
            </option>
            <option value="local">
              Local
            </option>
            <option value="airport">
              Airport
            </option>
          </select>

          <textarea
            name="message"
            rows={3}
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            className="input"
          />

          <button className="w-full bg-yellow-500 py-2 rounded-lg font-semibold">
            Send on WhatsApp
          </button>
        </form>
      </div>

      {/* INPUT STYLE */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default ContactPopup;