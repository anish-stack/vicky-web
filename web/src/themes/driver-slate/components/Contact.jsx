import { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

export default function Contact() {
  const { website } = useWebsite();
  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "Taxi Safar";
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;
  const email = basicInfo.email || `support@${companyName.toLowerCase().replace(/\s+/g, "")}.in`;
  const city = basicInfo.city || "Delhi";
  const serviceArea = basicInfo.serviceArea || "Delhi NCR";

  const [formData, setFormData] = useState({ name: "", phone: "", tripType: "one-way", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `New Enquiry - ${companyName}\n${basicInfo.logo_name || ""}\n\nName: ${formData.name}\nPhone: ${formData.phone}\nTrip Type: ${formData.tripType}\n\nMessage:\n${formData.message}`.trim();
    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", phone: "", tripType: "one-way", message: "" });
    }, 3000);
  };

  const methods = [
    { icon: Phone, title: "Call Us", value: `+91 ${phone}`, link: `tel:+91${phone}` },
    { icon: MessageCircle, title: "WhatsApp", value: `+91 ${whatsapp}`, link: `https://wa.me/91${whatsapp}` },
    { icon: Mail, title: "Email", value: email, link: `mailto:${email}` },
    { icon: MapPin, title: "Service Area", value: `${city} · ${serviceArea}`, link: null },
  ];

  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-sky-50 text-gray-900 text-sm font-medium placeholder-gray-400 outline-none ring-1 ring-transparent focus:ring-sky-400 focus:bg-white";

  return (
    <section id="contact" className="relative py-12 md:py-20 overflow-hidden">
      {/* Travel bg merged with light overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/96 via-sky-50/92 to-white/96" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-white shadow-sm text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            Contact Us
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            Ready When <span className="text-sky-600">You Are</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact methods */}
          <div className="grid sm:grid-cols-2 gap-5 content-start">
            {methods.map((m, i) => {
              const Wrapper = m.link ? "a" : "div";
              return (
                <Wrapper
                  key={i}
                  {...(m.link
                    ? { href: m.link, target: m.title === "WhatsApp" ? "_blank" : undefined, rel: "noopener noreferrer" }
                    : {})}
                  className={`bg-white rounded-2xl p-5 shadow-md shadow-gray-200/60 border-b-4 border-amber-400 transition-all ${
                    m.link ? "hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50 cursor-pointer" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-sky-600 flex items-center justify-center shadow-md shadow-sky-600/25">
                    <m.icon size={19} className="text-white" />
                  </div>
                  <p className="mt-3 font-extrabold text-gray-900 text-sm">{m.title}</p>
                  <p className="mt-1 text-xs text-gray-500 font-semibold break-all">{m.value}</p>
                </Wrapper>
              );
            })}
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-sky-900/10">
            <h3 className="text-xl font-extrabold text-gray-900">Send A Quick Message</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">We reply on WhatsApp within minutes.</p>

            <div className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className={inputCls} />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile Number" className={inputCls} />
              </div>
              <select name="tripType" value={formData.tripType} onChange={handleChange} className={inputCls}>
                <option value="one-way">One Way Trip</option>
                <option value="round-trip">Round Trip</option>
                <option value="local">Local / Rental</option>
                <option value="tour-package">Tour Package</option>
              </select>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your travel plan..."
                className={inputCls}
              />
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.phone}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-gray-900 font-extrabold shadow-lg shadow-amber-400/30 hover:bg-sky-600 hover:text-white hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 size={18} /> Sent On WhatsApp!
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Via WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
