import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ReceiptText, PhoneCall, Users, IdCard, CarFront, Building2, Plane, Clock3,
  Mountain, Tags, Percent, Settings, LogOut, Menu, X, Map, Hotel
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cx } from "./ui";

const NAV = [
  { items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }] },
  {
    title: "Bookings", items: [
      { to: "/bookings", label: "Paid bookings", icon: ReceiptText },
      { to: "/leads", label: "Leads & trips", icon: PhoneCall },
    ]
  },
  {
    title: "People", items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/drivers", label: "Drivers", icon: IdCard },
    ]
  },
  {
    title: "Fleet & pricing", items: [
      { to: "/vehicles", label: "Vehicles", icon: CarFront },
      { to: "/cities", label: "Cities", icon: Building2 },
      { to: "/airports", label: "Airports", icon: Plane },
      { to: "/rental-plans", label: "Local rental plans", icon: Clock3 },
    ]
  },
  {
    title: "Char Dham", items: [
      { to: "/dham/packages", label: "Packages", icon: Mountain },
      { to: "/dham/categories", label: "Categories", icon: Tags },
    ]
  },
  { title: "Tours", items: [
    { to: "/tour-packages", label: "Tour packages", icon: Map, end: true },
    { to: "/tour-hotels", label: "Hotels (master)", icon: Hotel },
    { to: "/tour-packages/bookings", label: "Tour bookings", icon: ReceiptText },
  ] },
  {
    title: "Discounts", items: [
      { to: "/discounts/one-way", label: "One way", icon: Percent },
      { to: "/discounts/round-trip", label: "Round trip", icon: Percent },
      { to: "/discounts/local-airport", label: "Local & airport", icon: Percent },
    ]
  },
  { items: [{ to: "/settings", label: "Payment settings", icon: Settings }] },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col bg-road-900 text-stone-300">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid size-8 place-items-center rounded-md bg-brand-500 text-sm font-bold text-white">
          <img src="https://i.ibb.co/Mk3cwgmS/image.png" />
        </span>
        <div className="leading-tight">
          <p className="font-semibold text-white">TaxiSafar</p>
          <p className="text-xs text-stone-400">Website Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((g, gi) => (
          <div key={gi}>
            {g.title && <p className="px-3 pb-1.5 text-xs font-medium text-stone-500">{g.title}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end={it.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cx(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive ? "bg-white/10 font-medium text-white shadow-[inset_3px_0_0_var(--color-brand-500)]" : "hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <it.icon className="size-4 shrink-0" />
                    {it.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium text-white">{user?.name || "Admin"}</p>
        <p className="truncate text-xs text-stone-400">{user?.email}</p>
        <button onClick={logout} className="mt-3 inline-flex items-center gap-2 text-sm text-stone-300 hover:text-white">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"><Sidebar /></aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64"><Sidebar onNavigate={() => setOpen(false)} /></aside>
          <button className="absolute left-66 top-4 rounded-md bg-white p-2" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-4" /></button>
        </div>
      )}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 hover:bg-stone-100" aria-label="Open menu"><Menu className="size-5" /></button>
        <span className="font-semibold">TaxiSafar admin</span>
      </header>
      <main key={pathname} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}