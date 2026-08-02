import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type Place = { label: string; value: string; order: number };

type BookingValue = {
  tab: "taxi" | "chardham" | "hotel";
  setTab: (t: "taxi" | "chardham" | "hotel") => void;
  places: Place[];
  setPlaces: (p: Place[]) => void;
};

const BookingContext = createContext<BookingValue>(null as any);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<"taxi" | "chardham" | "hotel">("taxi");
  const [places, setPlaces] = useState<Place[]>([]);

  const value = useMemo(() => ({ tab, setTab, places, setPlaces }), [tab, places]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export const useBooking = () => useContext(BookingContext);
