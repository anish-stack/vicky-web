import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useWebsite } from '@/context/WebsiteContext';
import axios from 'axios';
export default function Contact() {
  const { website } = useWebsite();


  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "Taxi Safar";
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone; // fallback to phone if no whatsapp
  const email = basicInfo.email || `support@${(companyName.toLowerCase().replace(/\s+/g, ''))}.in`;
  const city = basicInfo.city || "Delhi";
  const serviceArea = basicInfo.serviceArea || "Delhi NCR";
  const officeHours = basicInfo.officeHours || "24/7 Available";

  const contactMethods = [
    {
      icon: <Phone size={28} />,
      title: "Call Us",
      value: `+91 ${phone}`,
      link: `tel:+91${phone}`,
      description: "24/7 Customer Support",
      color: "bg-blue-500",
    },
    {
      icon: <MessageCircle size={28} />,
      title: "WhatsApp",
      value: `+91 ${whatsapp}`,
      link: `https://wa.me/91${whatsapp}`,
      description: "Quick Response",
      color: "bg-green-500",
    },
    {
      icon: <Mail size={28} />,
      title: "Email",
      value: email,
      link: `mailto:${email}`,
      description: "Reply within 2 hours",
      color: "bg-red-500",
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tripType: 'one-way',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Enquiry submitted:", formData);

    try {

      const response = await axios.post(`https://www.driverwebiste.taxisafar.com/api/contact`, { ...formData, website })
      setIsSubmitted(true);

      if (response.data.success) {
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '', phone: '', email: '', tripType: 'one-way', message: ''
          });
        }, 3200);
      }

    } catch (error) {
      console.log(error?.response.data)

    }
  };

  return (
    <section
      id="contact"
      className="relative py-10 md:py-16 bg-gradient-to-br from-gray-50 via-white to-red-50/30 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-red-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-red-100 text-red-700 font-semibold text-sm md:text-base">
            Contact {companyName}
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Let's Start Your <span className="text-red-600">Journey</span>
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Questions? Booking? Quote? We're here for you — usually reply in <strong>under 2 hours</strong>.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Contact cards + Office info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-1 space-y-7"
          >
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl p-7 md:p-8 shadow-xl border border-gray-100/80">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                {contactMethods.map((method, idx) => (
                  <motion.a
                    key={idx}
                    href={method.link}
                    target={method.title === "WhatsApp" ? "_blank" : undefined}
                    rel={method.title === "WhatsApp" ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                    whileHover={{ scale: 1.03, translateX: 6 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/70 border border-gray-200 hover:border-red-400 hover:bg-red-50/60 transition-all group"
                  >
                    <div className={`${method.color} p-3.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm`}>
                      <div className="text-white">{method.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 font-medium">{method.title}</div>
                      <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                        {method.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{method.description}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Office Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-white rounded-2xl p-7 md:p-8 shadow-xl border border-gray-100/80"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-xl">
                    <MapPin className="text-red-600" size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Our Office</h4>
                    <p className="text-gray-700 mt-1.5 leading-relaxed">
                      {companyName}<br />
                      {city}, {serviceArea.split(',')[0]}<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-5 border-t border-gray-100">
                  <div className="bg-red-50 p-3 rounded-xl">
                    <Clock className="text-red-600" size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Availability</h4>
                    <p className="text-gray-700 mt-1.5">{officeHours}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Form */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl p-8 lg:p-10 xl:p-12 shadow-2xl border border-gray-100/80">
              {!isSubmitted ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                      Send Your Enquiry
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Fill in your details — we'll get back to you very soon.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Trip Type *
                        </label>
                        <select
                          name="tripType"
                          value={formData.tripType}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none bg-gray-50 hover:bg-white text-gray-900"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message / Trip Details *
                      </label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none resize-none bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
                        placeholder="Pickup city • Drop city • Date • Passengers • Vehicle preference • Any special request..."
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-200/50 transition-all"
                    >
                      <Send size={22} />
                      Send Enquiry
                    </motion.button>

                    <p className="text-center text-sm text-gray-500 pt-2">
                      We usually respond within 2 hours during working hours
                    </p>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 md:py-32"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
                    <CheckCircle2 className="text-green-600" size={48} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Thank You!</h3>
                  <p className="text-xl text-gray-600">Your enquiry has been sent successfully.</p>
                  <p className="text-gray-500 mt-3">We'll get in touch with you very soon.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}