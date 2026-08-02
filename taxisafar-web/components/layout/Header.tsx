import Link from "next/link";
import { useState } from "react";
import { Menu, X, UserRound } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Char Dham", href: "/chardham" },
  { label: "Packages", href: "/packages" },
  { label: "Hotels", href: "/hotel" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * `compact` renders the results-page header from the design: logo on the left
 * and a single account button on the right, no nav.
 */
export default function Header({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user, openLogin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        {!compact && (
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink-soft transition-colors hover:text-brand-500"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/my-bookings"
                className="hidden rounded-lg border border-line px-4 py-2 text-sm sm:inline-flex"
              >
                My Bookings
              </Link>
              <button
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-full border border-line"
                aria-label="Sign out"
              >
                <UserRound size={18} />
              </button>
            </div>
          ) : compact ? (
            <button
              onClick={openLogin}
              className="grid h-10 w-10 place-items-center rounded-full border border-line"
              aria-label="Sign in"
            >
              <UserRound size={18} />
            </button>
          ) : (
            <>
              <button onClick={openLogin} className="btn-outline hidden sm:inline-flex">
                Register
              </button>
              <button onClick={openLogin} className="btn-primary">
                Sign In
              </button>
            </>
          )}

          {!compact && (
            <button
              className="ml-1 grid h-10 w-10 place-items-center rounded-lg border border-line lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {open && !compact && (
        <nav className="border-t border-line bg-white lg:hidden" aria-label="Mobile">
          <div className="container flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3 text-sm text-ink-soft last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
