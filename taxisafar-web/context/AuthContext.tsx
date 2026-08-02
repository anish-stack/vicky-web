import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { request, setAccessToken } from "@/lib/api";

type AuthValue = {
  user: any | null;
  loading: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  sendOtp: (phone: string, purpose?: string) => Promise<any>;
  verifyOtp: (phone: string, otp: string, extra?: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await request("post", "/auth/refresh");
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const sendOtp = useCallback(
    (phone: string, purpose = "verify") => request("post", "/auth/send-otp", { phone_number: phone, purpose }),
    []
  );

  const verifyOtp = useCallback(async (phone: string, otp: string, extra: any = {}) => {
    const { data } = await request("post", "/auth/verify-otp", {
      phone_number: phone,
      otp,
      purpose: "verify",
      ...extra,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    setLoginOpen(false);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await request("post", "/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginOpen,
      openLogin: () => setLoginOpen(true),
      closeLogin: () => setLoginOpen(false),
      sendOtp,
      verifyOtp,
      logout,
      refreshUser,
    }),
    [user, loading, loginOpen, sendOtp, verifyOtp, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
