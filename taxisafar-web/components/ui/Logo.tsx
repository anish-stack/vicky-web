import Link from "next/link";

/** Wordmark from the brand sheet: red monogram, black "Taxi", red "Safar". */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="TaxiSafar home">
      <svg width="34" height="24" viewBox="0 0 34 24" fill="none" aria-hidden="true">
        <path d="M4 18.5C7.5 18.5 9.5 16 13 16h9" stroke="#EF3124" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 5.5c-3.5 0-5.5 2.5-9 2.5h-9" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        <path d="M9 12h16" stroke="#EF3124" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl font-bold italic tracking-tight">
        <span className="text-ink">Taxi</span>
        <span className="text-brand-500">Safar</span>
      </span>
    </Link>
  );
}
