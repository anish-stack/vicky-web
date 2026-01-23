import React, { createContext, useState, useContext, ReactNode } from "react";

interface ContextProps {
  customerDetail: any | null;
  setCustomerDetail: React.Dispatch<React.SetStateAction<any | null>>;
}

const Context = createContext<ContextProps | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customerDetail, setCustomerDetail] = useState(null) as any;
  return (
    <Context.Provider value={{ customerDetail, setCustomerDetail }}>
      {children}
    </Context.Provider>
  );
};

export const useCustomerContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};
