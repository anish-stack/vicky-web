import React, { createContext, useState, useContext, ReactNode } from "react";

interface TripContextProps {
  allPlaces: any[];
  setAllPlaces: React.Dispatch<React.SetStateAction<any[]>>;
  tripType: string;
  setTripType: React.Dispatch<React.SetStateAction<string>>;
}

const TripContext = createContext<TripContextProps | undefined>(undefined);

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [tripType, setTripType] = useState<string>("oneWay");

  return (
    <TripContext.Provider value={{ allPlaces, setAllPlaces, tripType, setTripType }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};
