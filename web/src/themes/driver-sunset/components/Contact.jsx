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
    { icon: Phone, title: "Call Us", value: `+91 ${phone}`, link: `tel:+91${phone}`, bg: "bg-amber-100" },
    { icon: MessageCircle, title: "WhatsApp", value: `+91 ${whatsapp}`, link: `https://wa.me/91${whatsapp}`, bg: "bg-green-100" },
    { icon: Mail, title: "Email", value: email, link: `mailto:${email}`, bg: "bg-rose-100" },
    { icon: MapPin, title: "Service Area", value: `${city} · ${serviceArea}`, link: null, bg: "bg-sky-100" },
  ];

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-orange-50/50 text-stone-900 text-sm font-medium placeholder-stone-400 focus:outline-none focus:border-orange-500";

  return (
    <section id="contact" className="py-12 md:py-20 bg-white border-t-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-orange-50 border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            Contact Us
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900">
            Say Hello, <span className="text-orange-600">Ride Happy</span> 👋
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
                  className={`rounded-2xl border-2 border-stone-900 bg-white p-5 shadow-[5px_5px_0px_0px_rgba(28,25,23,1)] transition-transform ${
                    m.link ? "hover:-translate-y-1 cursor-pointer" : ""
                  } ${i % 2 === 1 ? "sm:mt-4" : ""}`}
                >
                  <div className={`w-11 h-11 rounded-xl ${m.bg} border-2 border-stone-900 flex items-center justify-center`}>
                    <m.icon size={20} className="text-stone-900" />
                  </div>
                  <p className="mt-3 font-black text-stone-900 text-sm">{m.title}</p>
                  <p className="mt-1 text-xs text-stone-600 font-semibold break-all">{m.value}</p>
                </Wrapper>
              );
            })}
          </div>

          {/* Form */}
          <div className="rounded-3xl border-2 border-stone-900 bg-orange-50 p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(234,88,12,1)]">
            <h3 className="text-xl font-black text-stone-900">Send a Quick Message 📩</h3>
            <p className="text-xs text-stone-500 font-semibold mt-1">We reply on WhatsApp within minutes.</p>

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
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 text-white font-black border-2 border-stone-900 shadow-[5px_5px_0px_0px_rgba(28,25,23,1)] hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(28,25,23,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 size={18} /> Sent on WhatsApp!
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send via WhatsApp
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
