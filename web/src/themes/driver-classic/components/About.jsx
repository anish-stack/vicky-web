import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  IndianRupee,
  Users,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";

const stats = [
  { value: "5K+", label: "Monthly Rides", icon: Users },
  { value: "4.8", label: "Avg Rating", icon: Star },
  { value: "50+", label: "Expert Drivers", icon: Award },
  { value: "98%", label: "On-Time", icon: TrendingUp },
];

const features = [
  {
    title: "Verified & Secure",
    desc: "Professionally vetted drivers, live tracking, SOS support.",
    icon: ShieldCheck,
  },
  {
    title: "24×7 Availability",
    desc: "Anytime booking across Faridabad with instant confirmation.",
    icon: Clock,
  },
  {
    title: "Fair Pricing",
    desc: "Transparent fares with zero hidden charges.",
    icon: IndianRupee,
  },
];

export default function AboutModernLight() {
  return (
    <section id="about" className="relative py-6 md:py-10 bg-gradient-to-b from-white to-red-50 overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[420px] h-[420px] bg-red-200/40 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[520px] h-[520px] bg-red-100/60 blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-3 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-6 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 text-red-600 text-m font-bold">
            Why TaxiSafar
          </span>

          <h2 className="mt-4 md:mt-6 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
            Designed for{" "}
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Safe & Smart
            </span>{" "}
            Journeys
          </h2>

          <p className="mt-2 md:mt-3 text-lg text-gray-600">
            Premium taxi experience built around comfort, reliability and trust —
            trusted by thousands across Faridabad.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=90"
                alt="TaxiSafar service"
                className="h-[460px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur border border-red-200 rounded-2xl p-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-100">
                    <ShieldCheck size={26} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Safety Guaranteed
                    </p>
                    <p className="text-sm text-gray-600">
                      100% verified drivers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <div className="space-y-8">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group rounded-2xl p-3 bg-white border border-gray-200 hover:border-red-400 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-red-100 group-hover:bg-red-200 transition">
                    <item.icon className="text-red-600" size={28} />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
