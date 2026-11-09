import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // On page load, ask the server if we already have a valid session.
  useEffect(() => {
    api("/api/auth/me")
      .then((d) => setUser(d.authenticated ? d.user : null))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async (email, password) => {
    const d = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(d.user);
  };
  const signup = async (name, email, password) => {
    const d = await api("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });
    setUser(d.user);
  };
  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return <AuthContext.Provider value={{ user, checking, login, signup, logout }}>{children}</AuthContext.Provider>;
}
