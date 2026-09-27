import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { TOKEN_KEY } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return setReady(true);
    try {
      const res = await api.post("/users/verifyToken");
      setUser(res.user);
    } catch {
      logout();
    } finally {
      setReady(true);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    try {
      const me = await api.post("/users/verifyToken");
      setUser(me.user);
      return me.user;
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      throw new Error("This account has no admin access");
    }
  };

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
