"use client";

import React, { useState } from "react";
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

const Contact: React.FC = () => {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "TaxiSafar";
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;
  const email =
    basicInfo.email || `support@${companyName.toLowerCase().replace(/\s+/g, "")}.in`;
  const city = basicInfo.city || "Delhi";
  const serviceArea = basicInfo.serviceArea || "Delhi NCR";
  const officeHours = basicInfo.officeHours || "24/7 Available";

  const contactMethods = [
    {
      icon: <Phone size={20} />,
      title: "Call Us",
      value: `+91 ${phone}`,
      link: `tel:+91${phone}`,
    },
    {
      icon: <MessageCircle size={20} />,
      title: "WhatsApp",
      value: `+91 ${whatsapp}`,
      link: `https://wa.me/91${whatsapp}`,
    },
    {
      icon: <Mail size={20} />,
      title: "Email",
      value: email,
      link: `mailto:${email}`,
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    tripType: "one-way",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text = `
New Enquiry - ${companyName}

Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Trip Type: ${formData.tripType}

Message:
${formData.message}
`.trim();

    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", phone: "", email: "", tripType: "one-way", message: "" });
    }, 3000);
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            Contact {companyName}
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Let's Start Your <span className="text-emerald-600">Journey</span>
          </h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Questions? Bookings? Quotes? — Usually reply in{" "}
            <strong>under 2 hours</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column */}
          <div className="space-y-5 lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-3.5">
                {contactMethods.map((method, idx) => (
                  <a
                    key={idx}
                    href={method.link}
                    target={method.title === "WhatsApp" ? "_blank" : undefined}
                    rel={method.title === "WhatsApp" ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="bg-emerald-600 text-white p-2.5 rounded-md group-hover:scale-105 transition-transform flex-shrink-0">
                      {method.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-600">
                        {method.title}
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-emerald-700 text-sm truncate">
                        {method.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-md flex-shrink-0">
                    <MapPin className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Our Office</h4>
                    <p className="text-gray-700 text-xs mt-1 leading-relaxed">
                      {companyName}
                      <br />
                      {city}, {serviceArea.split(",")[0]}
                      <br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <div className="bg-emerald-50 p-2.5 rounded-md flex-shrink-0">
                    <Clock className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Availability</h4>
                    <p className="text-gray-700 text-xs mt-1">{officeHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
              {!isSubmitted ? (
                <>
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1.5">
                      Send Your Enquiry
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Fill details — we'll reply quickly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm bg-gray-50/70"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm bg-gray-50/70"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm bg-gray-50/70"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trip Type *
                        </label>
                        <select
                          name="tripType"
                          value={formData.tripType}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none bg-gray-50/70 text-sm"
                        >
                          <option value="one-way">One Way Trip</option>
                          <option value="round-trip">Round Trip</option>
                          <option value="outstation">Outstation Tour</option>
                          <option value="local">Local / Sightseeing</option>
                          <option value="airport">Airport Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message / Trip Details *
                      </label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-none text-sm bg-gray-50/70"
                        placeholder="Pickup • Drop • Date • Passengers • Vehicle • Requests..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Send size={16} />
                      Send Enquiry
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-1.5">
                      Usually respond within 2 hours
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-14">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 text-sm">Enquiry sent successfully.</p>
                  <p className="text-gray-500 text-xs mt-1.5">We'll contact you soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
