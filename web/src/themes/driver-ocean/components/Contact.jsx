import { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
import { Garland } from "./Header";

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
    "w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-[#fffbf2] text-slate-900 text-sm font-bold placeholder-slate-400 outline-none focus:border-pink-700";

  return (
    <section id="contact" className="bg-pink-700 relative">
      <Garland className="bg-white" />
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-5 py-2 rounded-full bg-white text-pink-800 text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
            Contact Us
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
            One Call And The <span className="text-amber-300">Cab Is Yours</span> 🚕
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
                  className={`rounded-2xl bg-pink-800/60 border-2 border-pink-500 p-5 transition-all ${
                    m.link ? "hover:bg-pink-800 hover:-translate-y-1 cursor-pointer" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center shadow-md">
                    <m.icon size={19} className="text-pink-900" />
                  </div>
                  <p className="mt-3 font-black text-white text-sm uppercase tracking-wide">{m.title}</p>
                  <p className="mt-1 text-xs text-pink-100 font-bold break-all">{m.value}</p>
                </Wrapper>
              );
            })}
          </div>

          {/* Form */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(245,158,11,0.9)]">
            <h3 className="text-xl font-black text-slate-900">Send A Quick Message</h3>
            <p className="text-xs text-slate-400 font-black uppercase tracking-wide mt-1">
              We reply on WhatsApp within minutes
            </p>

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
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-pink-700 text-white font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 size={17} /> Sent On WhatsApp!
                  </>
                ) : (
                  <>
                    <Send size={17} /> Send Via WhatsApp
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
