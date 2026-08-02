export default function SectionHeading({
  kicker,
  heading,
  subheading,
  align = "center",
}: {
  kicker?: string;
  heading?: string;
  subheading?: string;
  align?: "center" | "left";
}) {
  if (!heading && !kicker) return null;
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {kicker ? <p className="kicker mb-2">{kicker}</p> : null}
      {heading ? (
        <h2 className="text-2xl leading-tight md:text-[34px] md:leading-[1.15]">{heading}</h2>
      ) : null}
      {subheading ? (
        <p className={`mt-3 whitespace-pre-line text-sm text-ink-muted ${align === "center" ? "mx-auto max-w-2xl" : ""}`}>
          {subheading}
        </p>
      ) : null}
    </div>
  );
}
