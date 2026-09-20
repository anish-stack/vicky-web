import { Tag, ShieldCheck, Sparkles, Headphones, Send } from "lucide-react";

const features = [
  { icon: Tag, title: "Affordable Pricing", desc: "Best rates, no hidden charges", color: "text-emerald-500 bg-emerald-50" },
  { icon: ShieldCheck, title: "Trusted Drivers", desc: "Background-verified professionals", color: "text-orange-500 bg-orange-50" },
  { icon: Sparkles, title: "Clean & Safe Cabs", desc: "Well-maintained and sanitized", color: "text-blue-500 bg-blue-50" },
  { icon: Headphones, title: "24/7 Customer Support", desc: "We're always here to help", color: "text-blue-500 bg-blue-50" },
];

export default function Features() {
  return (
    <section id="about" className="relative py-14 md:py-20 bg-white overflow-hidden">
      <Send size={220} className="hidden lg:block absolute top-6 right-0 text-orange-50 -rotate-12" strokeWidth={1} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900">
            Making Travel Better
            <br className="hidden sm:block" /> For Everyone
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <span className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900 text-sm md:text-base">{f.title}</h3>
              <p className="mt-1.5 text-xs md:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
