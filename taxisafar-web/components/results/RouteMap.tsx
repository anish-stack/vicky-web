/** Static embed — no Maps JS bundle, no key in the browser. */
export default function RouteMap({ places = [] }: { places: any[] }) {
  if (places.length < 2) return null;

  const origin = `place_id:${places[0].value}`;
  const destination = `place_id:${places[places.length - 1].value}`;
  const waypoints = places.slice(1, -1).map((p: any) => `place_id:${p.value}`).join("|");

  const src =
    `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY || ""}` +
    `&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}` +
    (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : "");

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-line">
      <iframe
        title="Trip route"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[320px] w-full border-0 md:h-[380px]"
      />
    </div>
  );
}
