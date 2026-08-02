import { Star } from "lucide-react";

export default function Stars({ value = 5, size = 14 }: { value?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-[#FFB020] text-[#FFB020]" : "fill-line text-line"}
        />
      ))}
    </span>
  );
}
