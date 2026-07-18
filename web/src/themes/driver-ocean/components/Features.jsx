import { ShieldCheck, Wallet, Clock, Car, UserCheck, PhoneCall, Route, Sparkles } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const features = [
  { icon: Wallet, title: "Fixed Honest Fares", desc: "Toll and state tax included — the price we quote is the price you pay." },
  { icon: ShieldCheck, title: "Trusted Drivers", desc: "Experienced, verified drivers who treat every guest with respect." },
  { icon: Clock, title: "24×7 On Duty", desc: "Midnight pickup or a 4 AM flight — the cab is always ready." },
  { icon: Car, title: "Spotless AC Cabs", desc: "Mini, Sedan, SUV, Innova — washed daily with the AC running cold." },
  { icon: Route, title: "One Way Drops", desc: "Pay only for your side of the journey — never for the cab's return." },
  { icon: UserCheck, title: "Talk To The Owner", desc: "No agents, no commission — the number you call is the owner's." },
  { icon: PhoneCall, title: "1-Minute Booking", desc: "One call or one WhatsApp message and your cab is booked." },
  { icon: Sparkles, title: "Always On Time", desc: "We reach before you do — being late is simply not our style." },
];

export default function Features() {
  const { website } = useWebsite();
  const companyName = website?.basicInfo?.logo_name || website?.basicInfo?.name || "Us";

  return (
    <section className="py-12 md:py-20 bg-[#fffbf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-5 py-2 rounded-full bg-pink-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
            Why Choose Us
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-900">
            Why Riders Trust <span className="text-pink-700">{companyName}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border-2 border-pink-700/20 p-6 hover:border-pink-700 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(190,24,93,0.2)] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i % 2 === 0 ? "bg-pink-700" : "bg-amber-500"} shadow-md group-hover:-rotate-6 transition-transform`}>
                  <f.icon size={21} className="text-white" />
                </div>
                <span className="text-3xl font-black text-pink-700/10 select-none">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 font-black text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
