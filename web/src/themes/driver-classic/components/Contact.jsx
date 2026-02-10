import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useWebsite } from '@/context/WebsiteContext';

export default function Contact() {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "Taxi Safar";
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;
  const email = basicInfo.email || `support@${companyName.toLowerCase().replace(/\s+/g, '')}.in`;
  const city = basicInfo.city || "Delhi";
  const serviceArea = basicInfo.serviceArea || "Delhi NCR";
  const officeHours = basicInfo.officeHours || "24/7 Available";

  const contactMethods = [
    { icon: <Phone size={22} />, title: "Call Us", value: `+91 ${phone}`, link: `tel:+91${phone}`, description: "24/7 Support", color: "bg-blue-500" },
    { icon: <MessageCircle size={22} />, title: "WhatsApp", value: `+91 ${whatsapp}`, link: `https://wa.me/91${whatsapp}`, description: "Instant Reply", color: "bg-green-500" },
    { icon: <Mail size={22} />, title: "Email", value: email, link: `mailto:${email}`, description: "Quick Response", color: "bg-red-500" },
  ];

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', tripType: 'one-way', message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `
📩 *New Enquiry - ${companyName}*

👤 *Name:* ${formData.name}
📞 *Phone:* ${formData.phone}
📧 *Email:* ${formData.email}
🚖 *Trip Type:* ${formData.tripType}

📝 *Message:*
${formData.message}

🌐 *Website:* ${website || 'N/A'}
    `.trim();

    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', email: '', tripType: 'one-way', message: '' });
    }, 3000);
  };

  return (
    <section
      id="contact"
      className="relative py-8 md:py-14 bg-gradient-to-br from-gray-50 via-white to-red-50/20 overflow-x-hidden"
    >
      {/* Subtle blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-red-100/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-24 -right-16 w-64 h-64 bg-red-100/15 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }} // helps trigger earlier on mobile
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-50 text-red-700 text-xs sm:text-sm font-medium">
            Contact {companyName}
          </span>
          <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Let's Start Your <span className="text-red-600">Journey</span>
          </h2>
          <p className="mt-2 text-gray-600 text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
            Questions? Bookings? Quotes? — Usually reply in <strong>under 2 hours</strong>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5 lg:col-span-1"
          >
            {/* Contact cards */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-3.5">
                {contactMethods.map((method, idx) => (
                  <motion.a
                    key={idx}
                    href={method.link}
                    target={method.title === "WhatsApp" ? "_blank" : undefined}
                    rel={method.title === "WhatsApp" ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-red-300 hover:bg-red-50/30 transition-all group"
                  >
                    <div className={`${method.color} p-2.5 rounded-md group-hover:scale-105 transition-transform flex-shrink-0`}>
                      <div className="text-white">{method.icon}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-600">{method.title}</div>
                      <div className="font-semibold text-gray-900 group-hover:text-red-600 text-sm sm:text-base truncate">
                        {method.value}
                      </div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Office info */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-1 ">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 p-2.5 rounded-md flex-shrink-0">
                    <MapPin className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Our Office</h4>
                    <p className="text-gray-700 text-xs sm:text-sm mt-1 leading-relaxed">
                      {companyName}<br />
                      {city}, {serviceArea.split(',')[0]}<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <div className="bg-red-50 p-2.5 rounded-md flex-shrink-0">
                    <Clock className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Availability</h4>
                    <p className="text-gray-700 text-xs sm:text-sm mt-1">{officeHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-6 lg:p-8 ">
              {!isSubmitted ? (
                <>
                  <div className="mb-5">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1.5">
                      Send Your Enquiry
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Fill details — we'll reply quickly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition text-sm bg-gray-50/70 placeholder-gray-500"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition text-sm bg-gray-50/70 placeholder-gray-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition text-sm bg-gray-50/70 placeholder-gray-500"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Trip Type *
                        </label>
                        <select
                          name="tripType"
                          value={formData.tripType}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none bg-gray-50/70 text-sm appearance-none"
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Message / Trip Details *
                      </label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none text-sm bg-gray-50/70 placeholder-gray-500"
                        placeholder="Pickup • Drop • Date • Passengers • Vehicle • Requests..."
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Send size={16} />
                      Send Enquiry
                    </motion.button>

                    <p className="text-center text-xs text-gray-500 mt-1.5">
                      Usually respond within 2 hours
                    </p>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 sm:py-16"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 text-sm">Enquiry sent successfully.</p>
                  <p className="text-gray-500 text-xs mt-1.5">We'll contact you soon.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}