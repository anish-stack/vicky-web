"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type FormDataType = {
  name: string;
  phone: string;
  email: string;
  tripType: string;
  message: string;
};

const Contact = () => {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "Taxi Safar";
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;
  const email =
    basicInfo.email ||
    `support@${companyName.toLowerCase().replace(/\s+/g, "")}.in`;
  const city = basicInfo.city || "Delhi";
  const serviceArea = basicInfo.serviceArea || "Delhi NCR";
  const officeHours = basicInfo.officeHours || "24/7 Available";

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    phone: "",
    email: "",
    tripType: "one-way",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const text = `
📩 *New Enquiry - ${companyName}*

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
📧 Email: ${formData.email}
🚖 Trip: ${formData.tripType}

📝 Message:
${formData.message}
    `.trim();

    window.open(
      `https://wa.me/91${whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
    );

    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        tripType: "one-way",
        message: "",
      });
    }, 3000);
  };

  return (
    <section className="min-h-screen bg-[white] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Contact Us
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            Contact {companyName}
          </h2>

          <p className="text-l text-gray-600">
            Book your ride, get quotes, or ask anything — we reply fast.
          </p>
        </div>
        <div className=" grid lg:grid-cols-2 gap-8 items-stretch">
        {/* LEFT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative rounded-3xl overflow-hidden bg-[#FEAC00] text-white p-8 lg:p-10 flex flex-col justify-between"
        >
          {/* <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Contact {companyName}
            </h2>
            <p className="text-red-100 text-sm lg:text-base">
              Book your ride, get quotes, or ask anything — we reply fast.
            </p>
          </div> */}

          {/* Contact Cards */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur">
              <Phone />
              <div>
                <p className="text-sm opacity-80">Call Us</p>
                <p className="font-semibold">+91 {phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur">
              <MessageCircle />
              <div>
                <p className="text-sm opacity-80">WhatsApp</p>
                <p className="font-semibold">+91 {whatsapp}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur">
              <Mail />
              <div>
                <p className="text-sm opacity-80">Email</p>
                <p className="font-semibold break-all">{email}</p>
              </div>
            </div>
          </div>

          {/* Office Info */}
          <div className="mt-10 space-y-4 text-sm">
            <div className="flex gap-3">
              <MapPin />
              <span>
                {city}, {serviceArea}
              </span>
            </div>

            <div className="flex gap-3">
              <Clock />
              <span>{officeHours}</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT FORM */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 lg:p-10"
        >
          {!isSubmitted ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Send Enquiry
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="input"
                  />

                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="input"
                  />

                  <select
                    name="tripType"
                    value={formData.tripType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="one-way">One Way</option>
                    <option value="round-trip">Round Trip</option>
                    <option value="outstation">Outstation</option>
                    <option value="local">Local</option>
                    <option value="airport">Airport</option>
                  </select>
                </div>

                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Trip details..."
                  className="input"
                />

                <button className="w-full bg-[#FEAC00] hover:bg-[#ca9903] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition">
                  <Send size={18} />
                  Send via WhatsApp
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-16">
              <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Thank You!</h3>
              <p className="text-gray-600 text-sm">
                Your enquiry has been sent.
              </p>
            </div>
          )}
        </motion.div>
        </div>
      </div>

      {/* Reusable Input Style */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          outline: none;
          font-size: 14px;
          background: white;
          transition: 0.2s;
        }
        .input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px #fee2e2;
        }
      `}</style>
    </section>
  );
};

export default Contact;
