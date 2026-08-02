import { ShieldCheck, Clock, IndianRupee, Car, Headphones, HeartHandshake } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const features = [
  { title: "Verified Drivers", desc: "Background-checked, polite and experienced chauffeurs.", icon: ShieldCheck },
  { title: "24×7 Booking", desc: "Early morning or late night — we are always available.", icon: Clock },
  { title: "Honest Pricing", desc: "Toll & taxes included in fares. No hidden surprises.", icon: IndianRupee },
  { title: "Clean AC Cabs", desc: "Well-maintained Mini, Sedan, SUV & Prime SUV fleet.", icon: Car },
  { title: "Quick Support", desc: "Fast replies on WhatsApp and call throughout your trip.", icon: Headphones },
  { title: "Customer First", desc: "Flexible stops, comfortable rides and warm service.", icon: HeartHandshake },
];

export default function Features() {
  const { website } = useWebsite();
  const name = website?.basicInfo?.name || "Us";

  return (
    <section id="about" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-white border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            Why {name}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900">
            Travel That Feels <span className="text-orange-600">Good</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-3xl border-2 border-orange-200 p-5 md:p-6 hover:border-orange-400 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <item.icon size={22} className="text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="mt-4 text-base md:text-lg font-black text-stone-900">{item.title}</h3>
              <p className="mt-1.5 text-xs md:text-sm text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 bg-orange-600 rounded-3xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-[8px_8px_0px_0px_rgba(154,52,18,0.3)]">
          {[
            { value: "5K+", label: "Happy Riders" },
            { value: "4.8★", label: "Average Rating" },
            { value: "100+", label: "Routes Covered" },
            { value: "24×7", label: "Support" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="mt-1 text-xs font-bold text-orange-100 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
