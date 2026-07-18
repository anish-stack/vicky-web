import { ShieldCheck, Wallet, Clock, Car, UserCheck, PhoneCall, Route, Sparkles } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const features = [
  { icon: Wallet, title: "Transparent Fares", desc: "Fixed all-inclusive pricing — toll & state tax covered. Only parking extra." },
  { icon: ShieldCheck, title: "Verified Drivers", desc: "Experienced, background-checked drivers who know every route." },
  { icon: Clock, title: "24×7 Availability", desc: "Midnight pickup or early-morning airport run — we are always on." },
  { icon: Car, title: "Clean AC Fleet", desc: "Sanitised Mini, Sedan, SUV & Innova Crysta — serviced regularly." },
  { icon: Route, title: "One Way Drops", desc: "Pay only for your side of the journey, not the cab's return." },
  { icon: UserCheck, title: "Direct Owner Contact", desc: "No middlemen, no hidden commission — talk directly to us." },
  { icon: PhoneCall, title: "1-Minute Booking", desc: "Book instantly via WhatsApp or a single phone call." },
  { icon: Sparkles, title: "On-Time Guarantee", desc: "We reach before you do. Punctuality is our reputation." },
];

export default function Features() {
  const { website } = useWebsite();
  const companyName = website?.basicInfo?.logo_name || website?.basicInfo?.name || "Us";

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-white">
      {/* Faint travel bg merged into section */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "url(https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            The <span className="text-sky-600">{companyName}</span> Promise
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/70 border-b-4 border-transparent hover:border-amber-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                  <f.icon size={21} className="text-sky-600" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-extrabold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
